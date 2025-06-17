import { Request, Response } from 'express';
import SystemSetting, { ISystemSetting } from '../models/systemSetting.model';
import Student, { IStudent } from '../models/student.model';
import CodeforcesProfileSyncService from '../services/codeforcesSync.service';
import mongoose from 'mongoose';
import cron from 'node-cron';
import CronScheduler from '../services/cronSchedule.service';

const generateCronExpression = (input: string): string => {
  input = input.toLowerCase().trim();

  const daysMap: { [key: string]: number } = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const timeRegex = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/;
  const match = input.match(timeRegex);

  if (!match) throw new Error("Invalid time format");

  let [_, hourStr, minStr = "0", meridian] = match;
  let hour = parseInt(hourStr);
  const minute = parseInt(minStr);

  if (meridian === "pm" && hour < 12) hour += 12;
  if (meridian === "am" && hour === 12) hour = 0;

  // Handle patterns
  if (input.includes("every day")) return `${minute} ${hour} * * *`;
  if (input.includes("every weekday")) return `${minute} ${hour} * * 1-5`;
  if (input.includes("every weekend")) return `${minute} ${hour} * * 0,6`;

  const day = Object.keys(daysMap).find((d) => input.includes(d));
  if (day) return `${minute} ${hour} * * ${daysMap[day]}`;

  throw new Error("Could not parse input");
}

export const createSettings = async (req: Request, res: Response) => {
  try {
    const { scheduleInput = 'every day at 2am' } = req.body;
    const adminId = req.user?._id;

    const existingSettings = await SystemSetting.findOne();
    if (existingSettings) {
      return res.status(400).json({
        success: false,
        message: 'Settings already exist. Use update endpoint instead.'
      });
    }

    let cronSchedule: string;
    try {
      cronSchedule = generateCronExpression(scheduleInput);
    } catch (error: any) {
      cronSchedule = '0 2 * * *';
    }

    const defaultSettings = new SystemSetting({
      cronSchedule,
      scheduleInput,
      lastUpdatedBy: adminId,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedSettings = await defaultSettings.save();

    res.status(201).json({
      success: true,
      message: 'Settings created successfully',
      settings: {
        ...savedSettings.toObject(),
        generatedCronExpression: cronSchedule
      }
    });
  } catch (error: any) {
    console.error('Error creating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await SystemSetting.findOne();
    if (!settings) {
      res.status(404).json({
        success: false,
        message: 'Settings not found'
      });
    }
    res.status(200).json({
      success: true,
      settings
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { scheduleInput } = req.body;
    const adminId = req.user?._id;

    if (!scheduleInput) {
      return res.status(400).json({
        success: false,
        message: 'scheduleInput is required'
      });
    }

    const settings = await SystemSetting.findOne();
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Settings not found. Please create settings first.'
      });
    }

    // cron expression from scheduleInput
    let cronSchedule: string;
    try {
      cronSchedule = generateCronExpression(scheduleInput);
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: `Invalid schedule input: ${error.message}`
      });
    }

    if (!cron.validate(cronSchedule)) {
      return res.status(400).json({
        success: false,
        message: 'Generated cron expression is invalid'
      });
    }

    // update settings
    settings.cronSchedule = cronSchedule;
    settings.scheduleInput = scheduleInput;
    settings.lastUpdatedBy = adminId;
    settings.updatedAt = new Date();

    await settings.save();

    try {
      await CronScheduler.updateSchedule();
    } catch (schedulerError) {
      console.error('Error updating cron scheduler:', schedulerError);
    }

    res.status(200).json({
      success: true,
      message: 'Settings updated and cron schedule refreshed successfully',
      settings: {
        ...settings.toObject(),
        generatedCronExpression: cronSchedule
      }
    });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

export const syncAllProfiles = async (req: Request, res: Response) => {
  try {
    const studentIds = (await Student.distinct('_id')) as mongoose.Types.ObjectId[];
    if (studentIds.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No students found'
      });
    }
    const { totalStudents, successCount, errorCount } = await CodeforcesProfileSyncService.syncAllProfiles(studentIds);
    res.status(200).json({
      success: true,
      message: 'All profiles synced successfully',
      result: {
        totalStudents,
        successCount,
        errorCount
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

export const syncProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      res.status(404).json({
        success: false,
        message: 'Student not found'
      });
      return;
    }
    await CodeforcesProfileSyncService.syncSingleProfile(student._id as mongoose.Types.ObjectId);
    res.status(200).json({
      success: true,
      message: 'Profile synced successfully'
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message || 'Unknown error'
    });

  }
}