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
