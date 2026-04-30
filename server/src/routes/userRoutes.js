import express from 'express';
import { getMe, getAllUsers, deleteUser, getAllAdmins, addAdmin, deleteAdmin } from '../controllers/userController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', verifyToken, getMe);
router.get('/', verifyToken, requireAdmin, getAllUsers);
router.delete('/:email', verifyToken, requireAdmin, deleteUser);

router.get('/admins', verifyToken, requireAdmin, getAllAdmins);
router.post('/admins', verifyToken, requireAdmin, addAdmin);
router.delete('/admins/:email', verifyToken, requireAdmin, deleteAdmin);

export default router;
