import express from 'express';
import { submitFeedback, getFeedbacks, updateFeedbackStatus } from '../controllers/feedbackController.js';
import { verifyToken, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, submitFeedback);
router.get('/', verifyToken, requireStaffOrAdmin, getFeedbacks);
router.put('/:id/status', verifyToken, requireAdmin, updateFeedbackStatus);

export default router;
