import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { create, deleteStudent, getAll, getById, update } from '../controllers/student.controller';

const router = express.Router();

router.get('/:id', protect as express.RequestHandler, getById as express.RequestHandler);
router.get('/', protect as express.RequestHandler, getAll as express.RequestHandler);
router.post('/', protect as express.RequestHandler, create as express.RequestHandler);
router.patch('/:id', protect as express.RequestHandler, update as express.RequestHandler);
router.delete('/:id', protect as express.RequestHandler, deleteStudent as express.RequestHandler);

export default router;