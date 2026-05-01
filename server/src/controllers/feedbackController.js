import { query } from '../config/db.js';

export const submitFeedback = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message) {
            return res.status(400).json({ message: 'Feedback message is required' });
        }

        // Try to parse analytics data from the message if it's JSON
        let rating = null;
        let feedbackType = 'suggestion';
        let itemName = null;

        try {
            const details = JSON.parse(message);
            rating = details.stars || details.rating || null;
            feedbackType = details.type || 'suggestion';
            itemName = details.mealItem || details.itemName || null;
        } catch (e) {
            // Not JSON, fallback to defaults
        }

        const result = await query(
            'INSERT INTO feedbacks (user_id, message, rating, feedback_type, item_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, message, created_at',
            [userId, message, rating, feedbackType, itemName]
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
            SELECT f.id, f.message, f.status, f.created_at, u.email as user_email 
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

export const updateFeedbackStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Open', 'Pending', 'Resolved'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const result = await query(
            'UPDATE feedbacks SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.json({ message: 'Status updated successfully', feedback: result.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating status' });
    }
};

export const getFeedbackStats = async (req, res) => {
    try {
        // 1. Total Counts & Averages
        const summaryResult = await query(`
            SELECT 
                COUNT(*) as total_count,
                AVG(rating) as avg_rating,
                COUNT(*) FILTER (WHERE feedback_type = 'complaint') as complaint_count,
                COUNT(*) FILTER (WHERE feedback_type = 'praise') as praise_count
            FROM feedbacks
        `);

        // 2. Rating Distribution
        const ratingDistResult = await query(`
            SELECT rating, COUNT(*) as count 
            FROM feedbacks 
            WHERE rating IS NOT NULL 
            GROUP BY rating 
            ORDER BY rating ASC
        `);

        // 3. Feedback Type Distribution
        const typeDistResult = await query(`
            SELECT feedback_type as type, COUNT(*) as count 
            FROM feedbacks 
            GROUP BY feedback_type
        `);

        // 4. Feedback Trend (Last 30 days)
        const trendResult = await query(`
            SELECT DATE(created_at) as date, COUNT(*) as count 
            FROM feedbacks 
            WHERE created_at > CURRENT_DATE - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `);

        // 5. Top Items
        const topItemsResult = await query(`
            SELECT item_name, COUNT(*) as count 
            FROM feedbacks 
            WHERE item_name IS NOT NULL AND item_name != ''
            GROUP BY item_name
            ORDER BY count DESC
            LIMIT 5
        `);

        res.json({
            summary: summaryResult.rows[0],
            ratingDistribution: ratingDistResult.rows,
            typeDistribution: typeDistResult.rows,
            trend: trendResult.rows,
            topItems: topItemsResult.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching stats' });
    }
};
