import { query } from '../config/db.js';

export const saveMeal = async (req, res) => {
    try {
        const { date, lunch, dinner } = req.body;
        const userId = req.user.id;

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        const selectedDate = new Date(date).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const currentHour = new Date().getHours();

        // Validation Rules
        if (lunch === true) {
            if (selectedDate !== tomorrow) {
                return res.status(400).json({ message: 'Lunch can only be selected for tomorrow.' });
            }
        }

        if (dinner === true) {
            if (selectedDate !== today) {
                return res.status(400).json({ message: 'Dinner can only be selected for today.' });
            }
            if (currentHour >= 10) {
                return res.status(400).json({ message: 'Dinner selection closed after 10 AM.' });
            }
        }

        // Upsert Meal Entry
        const result = await query(
            `INSERT INTO meals (user_id, date, lunch, dinner)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id, date)
             DO UPDATE SET lunch = EXCLUDED.lunch, dinner = EXCLUDED.dinner, created_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [userId, selectedDate, lunch || false, dinner || false]
        );

        res.status(200).json({
            message: 'Meal selection saved successfully',
            meal: result.rows[0]
        });

    } catch (error) {
        console.error('Error saving meal:', error);
        res.status(500).json({ message: 'Server error while saving meal selection' });
    }
};

export const getMeal = async (req, res) => {
    try {
        const { date } = req.query;
        const userId = req.user.id;

        if (!date) {
            return res.status(400).json({ message: 'Date is required' });
        }

        const selectedDate = new Date(date).toISOString().split('T')[0];

        const result = await query(
            'SELECT * FROM meals WHERE user_id = $1 AND date = $2',
            [userId, selectedDate]
        );

        res.status(200).json({
            meal: result.rows[0] || { user_id: userId, date: selectedDate, lunch: false, dinner: false }
        });

    } catch (error) {
        console.error('Error fetching meal:', error);
        res.status(500).json({ message: 'Server error while fetching meal selection' });
    }
};

export const getMealSummary = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        // Total Dinner Today
        const dinnerTodayResult = await query(
            'SELECT COUNT(*) FROM meals WHERE date = $1 AND dinner = true',
            [today]
        );

        // Total Lunch Tomorrow
        const lunchTomorrowResult = await query(
            'SELECT COUNT(*) FROM meals WHERE date = $1 AND lunch = true',
            [tomorrow]
        );

        res.status(200).json({
            dinnerToday: parseInt(dinnerTodayResult.rows[0].count),
            lunchTomorrow: parseInt(lunchTomorrowResult.rows[0].count)
        });

    } catch (error) {
        console.error('Error fetching meal summary:', error);
        res.status(500).json({ message: 'Server error while fetching meal summary' });
    }
};
