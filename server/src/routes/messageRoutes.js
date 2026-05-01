import express from 'express';
import { getMessages, sendMessage } from '../controllers/messageController.js';
import { verifyToken, requireStaffOrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, getMessages);
router.post('/', verifyToken, requireStaffOrAdmin, sendMessage);

export default router;
