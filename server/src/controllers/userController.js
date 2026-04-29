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
