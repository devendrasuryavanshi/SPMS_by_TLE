import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
// import { v4 as uuidv4 } from 'uuid';
import User, { IUser } from '../models/user.model';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d'; // 7 days
const maxAge = 7 * 24 * 60 * 60 * 1000;
const isRegistrationEnabled = false;

const generateToken = (user: IUser) => {
  const payload = {
    id: user.id,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}


// Registers a new user if registration is enabled
export const register = async (req: Request, res: Response) => {
  try {
    if (!isRegistrationEnabled) {
      return res.status(403).json({
        success: false,
        message: 'User registration is currently disabled.'
      });
    }

    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = new User({ name, email, password, role });
    await user.save({
      validateBeforeSave: true
    });

    const token = generateToken(user);

    // auth cookie
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'none',
      maxAge,
      secure: true
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email
        },
      }
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
    console.error(error);
  }
}

// Logs in a user
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // check if the password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'none',
      maxAge,
      secure: true
    });

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      data: {
        user: {
          name: user.name,
          email: user.email
        },
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again later.'
    });
  }
};

// Returns the currently authenticated user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Logs out the user by clearing the auth cookie
export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie('token');// clear the auth  cookie
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};