import { query } from '../config/db.js';

export const getMenu = async (req, res) => {
    try {
        const result = await query('SELECT id, date, items, created_at FROM menu_overrides ORDER BY date DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching menu' });
    }
};

export const addMenuOverride = async (req, res) => {
    try {
        const { date, items } = req.body;

        if (!date || !items) {
            return res.status(400).json({ message: 'Date and items are required' });
        }

        const result = await query(
            'INSERT INTO menu_overrides (date, items) VALUES ($1, $2) ON CONFLICT (date) DO UPDATE SET items = EXCLUDED.items RETURNING id, date, items, created_at',
            [date, JSON.stringify(items)]
        );

        res.status(201).json({
            message: 'Menu override created',
            menu: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        // Postgres unique violation error code is 23505
        if (error.code === '23505') {
            return res.status(400).json({ message: 'A menu override for this date already exists' });
        }
        res.status(500).json({ message: 'Server error while creating menu override' });
    }
};

export const updateMenuOverride = async (req, res) => {
    try {
        const { id } = req.params;
        const { items } = req.body;

        if (!items) {
            return res.status(400).json({ message: 'Items are required for update' });
        }

        const result = await query(
            'UPDATE menu_overrides SET items = $1 WHERE id = $2 RETURNING id, date, items, created_at',
            [JSON.stringify(items), id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Menu override not found' });
        }

        res.json({
            message: 'Menu override updated',
            menu: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating menu override' });
    }
};
