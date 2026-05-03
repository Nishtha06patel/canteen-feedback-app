import express from 'express';
import { saveMeal, getMeal, getMealSummary } from '../controllers/mealController.js';
import { verifyToken, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/', verifyToken, saveMeal);
router.get('/', verifyToken, getMeal);

// Admin/Staff routes
router.get('/summary', verifyToken, requireStaffOrAdmin, getMealSummary);

export default router;
