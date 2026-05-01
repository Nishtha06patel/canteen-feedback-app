export const getMe = async (req, res) => {
    // The user object is already attached to req.user by the verifyToken middleware
    if (req.user) {
        res.json({
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const { query } = await import('../config/db.js');
        // Get both students and staff for the directory
        const result = await query(
            'SELECT id, email, role, is_blocked, blocked_at, blocked_by, created_at FROM users WHERE role IN ($1, $2) ORDER BY created_at DESC', 
            ['user', 'staff']
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

export const getAllAdmins = async (req, res) => {
    try {
        const { query } = await import('../config/db.js');
        const result = await query('SELECT id, email, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC', ['admin']);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching admins' });
    }
};

// Unified function to add Student or Staff (Admin Only)
export const addUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        const { email, password, role = 'user', fullName = '' } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
        
        // Only enforce @iar.ac.in for students if needed, but per request, let's keep it consistent
        if (role === 'user' && !email.toLowerCase().endsWith('@iar.ac.in')) {
            return res.status(400).json({ message: 'Students must use an @iar.ac.in email' });
        }

        const { query } = await import('../config/db.js');

        // Enforce Canteen Staff limit (max 3)
        if (role === 'staff') {
            const staffCountResult = await query('SELECT COUNT(*) FROM users WHERE role = $1', ['staff']);
            if (parseInt(staffCountResult.rows[0].count) >= 3) {
                return res.status(403).json({ message: 'Only 3 canteen staff accounts are allowed' });
            }
        }

        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await query(
            'INSERT INTO users (email, full_name, password_hash, role) VALUES ($1, $2, $3, $4)',
            [email.toLowerCase(), fullName, hashedPassword, role]
        );
        res.status(201).json({ message: `${role === 'staff' ? 'Staff' : 'Student'} created successfully` });
    } catch (error) {
        console.error(error);
        if (error.code === '23505') return res.status(400).json({ message: 'Email is already registered.' });
        res.status(500).json({ message: 'Server error adding user' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can delete accounts.' });
        }
        
        const { email } = req.params;
        const { query } = await import('../config/db.js');
        await query('DELETE FROM users WHERE email = $1 AND role IN ($2, $3)', [email.toLowerCase(), 'user', 'staff']);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting user' });
    }
};

export const addAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can create other admins.' });
        }

        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
        if (!email.toLowerCase().endsWith('@iar.ac.in')) return res.status(400).json({ message: 'Must be an @iar.ac.in email' });

        const { query } = await import('../config/db.js');

        // Restrict Admin creation to a maximum limit
        const MAX_ADMINS = 2;
        const adminCountResult = await query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
        if (parseInt(adminCountResult.rows[0].count) >= MAX_ADMINS) {
            return res.status(403).json({ message: 'Admin limit reached. Only 2 admins allowed.' });
        }

        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
            [email.toLowerCase(), hashedPassword, 'admin']
        );
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === '23505') return res.status(400).json({ message: 'Email already registered.' });
        res.status(500).json({ message: 'Server error adding admin' });
    }
};

export const deleteAdmin = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const { email } = req.params;
        const { query } = await import('../config/db.js');
        
        const result = await query('SELECT count(*) FROM users WHERE role = $1', ['admin']);
        if (parseInt(result.rows[0].count) <= 1) {
            return res.status(400).json({ message: 'Cannot delete the only remaining admin' });
        }

        await query('DELETE FROM users WHERE email = $1 AND role = $2', [email.toLowerCase(), 'admin']);
        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting admin' });
    }
};

export const blockUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Only admins can block accounts.' });
        }

        const { email } = req.body;
        const adminId = req.user.id;
        const { query } = await import('../config/db.js');
        
        await query(
            'UPDATE users SET is_blocked = true, blocked_at = CURRENT_TIMESTAMP, blocked_by = $1 WHERE email = $2',
            [adminId, email.toLowerCase()]
        );
        
        res.json({ message: 'User blocked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error blocking user' });
    }
};

export const unblockUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied.' });
        }

        const { email } = req.body;
        const { query } = await import('../config/db.js');
        
        await query(
            'UPDATE users SET is_blocked = false, blocked_at = NULL, blocked_by = NULL WHERE email = $1',
            [email.toLowerCase()]
        );
        
        res.json({ message: 'User unblocked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error unblocking user' });
    }
};
