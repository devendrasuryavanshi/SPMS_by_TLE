import express from 'express';
import { register, login, getCurrentUser, logout } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/me', protect as express.RequestHandler, getCurrentUser as express.RequestHandler);
router.post('/register', register as express.RequestHandler);
router.post('/login', login as express.RequestHandler);
router.post('/logout', protect as express.RequestHandler, logout as express.RequestHandler);

export default router;