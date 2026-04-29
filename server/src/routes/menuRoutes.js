import express from 'express';
import { getMenu, addMenuOverride, updateMenuOverride } from '../controllers/menuController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getMenu);
router.post('/', verifyToken, requireAdmin, addMenuOverride);
router.put('/:id', verifyToken, requireAdmin, updateMenuOverride);

export default router;
