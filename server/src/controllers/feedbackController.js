import { query } from '../config/db.js';

export const submitFeedback = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({ message: 'Feedback message is required' });
        }

        const result = await query(
            'INSERT INTO feedbacks (user_id, message) VALUES ($1, $2) RETURNING id, message, created_at',
            [userId, message]
        );

        res.status(201).json({
            message: 'Feedback submitted successfully',
            feedback: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while submitting feedback' });
    }
};

export const getFeedbacks = async (req, res) => {
    try {
        const result = await query(`
            SELECT f.id, f.message, f.created_at, u.email as user_email 
            FROM feedbacks f 
            JOIN users u ON f.user_id = u.id 
            ORDER BY f.created_at DESC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching feedbacks' });
    }
};
