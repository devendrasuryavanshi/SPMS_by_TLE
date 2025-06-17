import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { createSettings, getSettings, syncAllProfiles, syncProfile, updateSettings } from '../controllers/sync.controller';

const router = express.Router();

// router.post('/settings', createSettings as express.RequestHandler);
router.get('/settings', protect as express.RequestHandler, getSettings as express.RequestHandler);
router.post('/settings', protect as express.RequestHandler, createSettings as express.RequestHandler);
router.put('/settings', protect as express.RequestHandler, updateSettings as express.RequestHandler);
router.post('/all', protect as express.RequestHandler, syncAllProfiles as express.RequestHandler);
router.post('/:id', protect as express.RequestHandler, syncProfile as express.RequestHandler);

export default router;