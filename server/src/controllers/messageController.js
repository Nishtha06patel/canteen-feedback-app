import { query } from '../config/db.js';

export const getMessages = async (req, res) => {
    try {
        const { role } = req.user;
        
        // Users can see messages directed to their role
        // Admin can see all messages
        let result;
        if (role === 'admin') {
            result = await query(`
                SELECT m.id, m.content, m.type, m.created_at, m.recipient_role, u.email as sender_email
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                ORDER BY m.created_at DESC
                LIMIT 50
            `);
        } else {
            result = await query(`
                SELECT m.id, m.content, m.type, m.created_at, u.email as sender_email
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.recipient_role = $1 OR m.sender_id = $2
                ORDER BY m.created_at DESC
                LIMIT 30
            `, [role, req.user.id]);
        }

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { content, type, recipient_role } = req.body;
        const sender_id = req.user.id;

        if (!content || !recipient_role) {
            return res.status(400).json({ message: 'Content and recipient role are required' });
        }

        // Role-based validation: Admin can send to anyone, Staff can only send to students
        if (req.user.role === 'staff' && recipient_role !== 'user') {
            return res.status(403).json({ message: 'Staff can only send messages to students' });
        }

        const result = await query(
            'INSERT INTO messages (sender_id, recipient_role, content, type) VALUES ($1, $2, $3, $4) RETURNING *',
            [sender_id, recipient_role, content, type || 'normal']
        );

        const newMessage = {
            ...result.rows[0],
            sender_email: req.user.email
        };

        // Socket emission will be handled in app.js or via a helper
        if (global.io) {
            global.io.to(recipient_role).emit('newMessage', newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error sending message' });
    }
};
