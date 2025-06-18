import express from 'express';
import { hasAdminAccess, hasCritialAccess, hasEditAccess, protect } from '../middleware/auth.middleware';
import { createSettings, getSettings, syncAllProfiles, syncProfile, toggleAutoSync, updateSchedule } from '../controllers/sync.controller';

const router = express.Router();

// router.post('/settings', createSettings as express.RequestHandler);
router.get('/settings', protect as express.RequestHandler, hasAdminAccess as express.RequestHandler, getSettings as express.RequestHandler);
router.post('/settings', protect as express.RequestHandler, hasAdminAccess as express.RequestHandler, createSettings as express.RequestHandler);
router.patch('/settings/auto-sync', protect as express.RequestHandler, hasCritialAccess as express.RequestHandler, toggleAutoSync as express.RequestHandler);
router.patch('/settings/schedule', protect as express.RequestHandler, hasEditAccess as express.RequestHandler, updateSchedule as express.RequestHandler);
router.post('/all', protect as express.RequestHandler, hasCritialAccess as express.RequestHandler, syncAllProfiles as express.RequestHandler);
router.post('/:id', protect as express.RequestHandler, hasCritialAccess as express.RequestHandler, syncProfile as express.RequestHandler);

export default router;