import express from 'express';
import { submitFeedback, getFeedbacks } from '../controllers/feedbackController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, submitFeedback);
router.get('/', verifyToken, requireAdmin, getFeedbacks);

export default router;
