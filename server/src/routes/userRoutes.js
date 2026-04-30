import express from 'express';
import { getMe, getAllUsers, deleteUser } from '../controllers/userController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', verifyToken, getMe);
router.get('/', verifyToken, requireAdmin, getAllUsers);
router.delete('/:email', verifyToken, requireAdmin, deleteUser);

export default router;
