import express from 'express';
import { getContestHistory, getProblemSolvingData, getRecommendedProblems, toggleAutoEmail } from '../controllers/studentProfile.controller';

const router = express.Router();

router.get('/contest-history/:studentId', getContestHistory as express.RequestHandler);
router.get('/problem-solving/:studentId', getProblemSolvingData as express.RequestHandler);
router.get('/recommendations/:studentId', getRecommendedProblems as express.RequestHandler);
router.patch('/toggle-email/:studentId', toggleAutoEmail as express.RequestHandler);

export default router;
