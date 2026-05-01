import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

export const verifyToken = async (req, res, next) => {
    let token;

    // Check for token in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
        // Fallback for cookie-based auth
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        const secret = process.env.JWT_SECRET || 'fallback_super_secret_key_change_in_production';
        const decoded = jwt.verify(token, secret);
        
        // Fetch user from database
        const result = await query('SELECT id, email, role, is_blocked FROM users WHERE id = $1', [decoded.id]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'User not found' });
        }

        const user = result.rows[0];

        // Check if user is blocked
        if (user.is_blocked) {
            return res.status(403).json({ message: 'Your account has been blocked by admin. Contact support.' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

export const requireStaffOrAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized, access restricted.' });
    }
};
