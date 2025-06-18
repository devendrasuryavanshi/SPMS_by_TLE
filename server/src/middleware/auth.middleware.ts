import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// extend req.user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

// middleware to check edit access
export const hasEditAccess = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser;
  if (user.role !== 'admin' || !user.adminConfig.hasEditAccess) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

// middleware to check delete access
export const hasDeleteAccess = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser;
  if (user.role !== 'admin' || !user.adminConfig.hasDeleteAccess) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

// middleware to check critial access like manual sync
export const hasCritialAccess = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser;
  if (user.role !== 'admin' || !user.adminConfig.hasCritialAccess) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

// middleware to check admin access
export const hasAdminAccess = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as IUser;
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
}

// middleware for auth
export const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token;

  if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token found' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, invalid token' });
  }
}