import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';

const generateToken = (id) => {
    const secret = process.env.JWT_SECRET || 'fallback_super_secret_key_change_in_production';
    return jwt.sign({ id }, secret, {
        expiresIn: '30d',
    });
};

export const register = async (req, res) => {
    try {
        const { email, password, role = 'user', secretCode = '' } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Validate role
        if (role !== 'user' && role !== 'admin' && role !== 'staff') {
            return res.status(400).json({ message: 'Invalid role provided' });
        }

        // Admin Secret Code Validation
        if (role === 'admin') {
            const expectedCode = process.env.ADMIN_SECRET_CODE || 'IAR-ADMIN-2026';
            if (secretCode !== expectedCode) {
                return res.status(403).json({ message: 'Invalid Admin Secret Code' });
            }
        }

        // Validate email domain for students and staff
        if ((role === 'user' || role === 'staff') && !email.toLowerCase().endsWith('@iar.ac.in')) {
            return res.status(400).json({ message: 'Email must belong to @iar.ac.in domain' });
        }

        // Check if user exists
        const userExists = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user with the specified role
        const result = await query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
            [email.toLowerCase(), hashedPassword, role]
        );

        const user = result.rows[0];

        res.status(201).json({
            id: user.id,
            email: user.email,
            role: user.role,
            token: generateToken(user.id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration', error: error.message, stack: error.stack });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password, role = 'user', secretCode = '' } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // Admin Secret Code Validation during Login
        if (role === 'admin') {
            const expectedCode = process.env.ADMIN_SECRET_CODE || 'IAR-ADMIN-2026';
            if (secretCode !== expectedCode) {
                return res.status(403).json({ message: 'Invalid Admin Secret Code' });
            }
        }

        // Fetch user
        const result = await query('SELECT id, email, password_hash, role, is_blocked FROM users WHERE email = $1', [email.toLowerCase()]);
        
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = result.rows[0];

        // Check if user is blocked
        if (user.is_blocked) {
            return res.status(403).json({ message: 'Your account has been blocked by admin. Contact support.' });
        }

        // Ensure role matches what they are trying to log in as
        if (user.role !== role) {
            return res.status(403).json({ message: `Account exists, but not as an ${role}` });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            id: user.id,
            email: user.email,
            role: user.role,
            token: generateToken(user.id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login', error: error.message, stack: error.stack });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ message: 'Please provide email and new password' });
        }

        const userExists = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await query('UPDATE users SET password_hash = $1 WHERE email = $2', [hashedPassword, email.toLowerCase()]);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during password reset' });
    }
};
