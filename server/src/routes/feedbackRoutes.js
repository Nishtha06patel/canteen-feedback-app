import express from 'express';
import { submitFeedback, getFeedbacks, updateFeedbackStatus, getFeedbackStats } from '../controllers/feedbackController.js';
import { verifyToken, requireAdmin, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, submitFeedback);
router.get('/', verifyToken, requireStaffOrAdmin, getFeedbacks);
router.get('/stats', verifyToken, requireStaffOrAdmin, getFeedbackStats);
router.put('/:id/status', verifyToken, requireStaffOrAdmin, updateFeedbackStatus);

export default router;
