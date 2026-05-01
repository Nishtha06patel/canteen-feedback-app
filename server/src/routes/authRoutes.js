import express from 'express';
import { register, login, resetPassword, getAdminCount } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.get('/admin-count', getAdminCount);

export default router;
