import { Request, Response } from 'express';
import Student, { IStudent } from '../models/student.model';
import { fetchCodeforcesUser, validateForm } from '../utils/student.utils';
import CodeforcesProfileSyncService from '../services/codeforcesSync.service';
import mongoose from 'mongoose';

// Create a new student
export const create = async (req: Request, res: Response) => {
  try {
    const { name, email, phoneNumber, codeforcesHandle } = req.body;

    const errors = validateForm(req.body);// validate from fields
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(' ')
      });
    }

    const codeforcesUser = await fetchCodeforcesUser(codeforcesHandle);
    if (!codeforcesUser) {
      res.status(400).json({
        success: false,
        message: 'Invalid Codeforces handle'
      });
    }

    // if student already exists
    const existingStudent = await Student.findOne({ codeforcesHandle });
    if (existingStudent) {
      res.status(400).json({
        success: false,
        message: 'Student already exists'
      });
    }

    const student: IStudent = new Student({
      name,
      avatarUrl: codeforcesUser?.avatar || codeforcesHandle.titlePhoto || '',
      email,
      phoneNumber,
      codeforcesHandle,
      rating: codeforcesUser?.rating || 0,
      maxRating: codeforcesUser?.maxRating || 0,
      rank: codeforcesUser?.rank || '',
      country: codeforcesUser?.country || '',
      lastSubmissionTime: new Date('2005-01-01T00:00:00.000Z'),// default value, which is older then codeforces launch date to ensure that we sync all the submissions
      lastDataSync: new Date('2005-01-01T00:00:00.000Z'),
      inactivityEmailCount: 0,
      autoEmailEnabled: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedStudent = await student.save({ validateBeforeSave: true });
    if (!savedStudent) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create student'
      });
    }

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student: savedStudent,
    });

    // sync the student's codeforces profile
    await CodeforcesProfileSyncService.syncSingleProfile(savedStudent._id as mongoose.Types.ObjectId);

  } catch (error: any) {
    // if validation error
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    } else {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

// udpate a student
export const update = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, phoneNumber, codeforcesHandle } = req.body;

    const errors = validateForm(req.body);// validate form fields
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(' ')
      });
    }

    const codeforcesUser = await fetchCodeforcesUser(codeforcesHandle);
    if (!codeforcesUser) {
      res.status(400).json({
        success: false,
        message: 'Invalid Codeforces handle'
      });
    }

    const student = await Student.findById(id);
    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        name,
        email,
        phoneNumber,
        codeforcesHandle,
        avatarUrl: codeforcesUser?.avatar || codeforcesHandle.titlePhoto || '',
        currentRating: codeforcesUser?.rating || 0,
        maxRating: codeforcesUser?.maxRating || 0,
        updatedAt: new Date()
      },
      { new: true, runValidators: true },
    );
    if (!updatedStudent) {
      res.status(400).json({
        success: false,
        message: 'Failed to update student'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      student: updatedStudent,
    });

    // Re-sync profile data after update
    await CodeforcesProfileSyncService.syncSingleProfile(new mongoose.Types.ObjectId(id));

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors
      });
    } else {
      console.error(error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
}

// delete a student by id
export const deleteStudent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // check if student exists
    const student = await Student.findById(id);
    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    await Student.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Student deleted successfully'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// get a student by id
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    res.status(200).json({
      success: true,
      student
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

// get all students
export const getAll = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '50', search = '', sortBy = 'name', order = 'asc', } = req.query;

    // query params to usable numbers
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // supported sortable fields
    const sortableFields = ['name', 'rating', 'rank', 'email', 'codeforcesHandle', 'updatedAt'];
    const sortField = sortableFields.includes(sortBy.toString()) ? sortBy.toString() : 'name';
    const sortOrder = order === 'desc' ? -1 : 1;

    const query = {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { codeforcesHandle: { $regex: search, $options: 'i' } },
      ],
    };

    const [totalCount, students] = await Promise.all([// parallel execution for totalCount and students
      Student.countDocuments(query),
      Student.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);// calculate total pages

    res.status(200).json({
      success: true,
      totalCount,
      totalPages,
      currentPage: pageNum,
      hasPreviousPage: pageNum > 1,
      hasNextPage: pageNum < totalPages,
      students,
    });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error. Please try again later.',
    });
  }
};