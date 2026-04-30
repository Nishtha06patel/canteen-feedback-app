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
        const result = await query('SELECT id, email, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC', ['user']);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { email } = req.params;
        const { query } = await import('../config/db.js');
        await query('DELETE FROM users WHERE email = $1 AND role = $2', [email.toLowerCase(), 'user']);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error deleting user' });
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

export const addAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
        if (!email.toLowerCase().endsWith('@iar.ac.in')) return res.status(400).json({ message: 'Must be an @iar.ac.in email' });

        const bcrypt = await import('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const { query } = await import('../config/db.js');
        await query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3)',
            [email.toLowerCase(), hashedPassword, 'admin']
        );
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.error(error);
        if (error.code === '23505') {
            return res.status(400).json({ message: 'Email is already registered.' });
        }
        res.status(500).json({ message: 'Server error adding admin' });
    }
};

export const deleteAdmin = async (req, res) => {
    try {
        const { email } = req.params;
        const { query } = await import('../config/db.js');
        
        // Prevent deleting the last admin
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
