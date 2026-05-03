import { query } from '../config/db.js';

export const getMessages = async (req, res) => {
    try {
        const { role, id } = req.user;
        const { all } = req.query;
        
        let queryStr;
        let queryParams = [];

        if (role === 'admin') {
            // Admin sees everything
            queryStr = `
                SELECT m.id, m.content, m.type, m.created_at, m.expires_at, m.recipient_role, u.email as sender_email
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                ORDER BY m.created_at DESC
            `;
        } else {
            // Students and Staff see only active (non-expired) messages
            // Staff see messages sent TO them or BY them
            // Students see messages sent TO them
            queryStr = `
                SELECT m.id, m.content, m.type, m.created_at, m.expires_at, u.email as sender_email
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE (m.expires_at > NOW()) 
                AND (m.recipient_role = $1 OR m.sender_id = $2)
                ORDER BY m.created_at DESC
            `;
            queryParams = [role, id];
        }

        console.log(`Fetching messages for role: ${role}, user: ${id}`);
        const result = await query(queryStr, queryParams);
        console.log(`Found ${result.rows.length} messages`);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { content, type, recipient_role, duration } = req.body;
        const sender_id = req.user.id;

        if (!content || !recipient_role) {
            return res.status(400).json({ message: 'Content and recipient role are required' });
        }

        // Default duration 24 hours if not provided
        const hoursToAdd = parseInt(duration) || 24;
        
        // Calculate expires_at
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + hoursToAdd);

        // Role-based validation
        if (req.user.role === 'staff' && !['admin', 'user'].includes(recipient_role)) {
            return res.status(403).json({ message: 'Staff can only send messages to the Administrator or Students' });
        }

        const result = await query(
            'INSERT INTO messages (sender_id, recipient_role, content, type, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [sender_id, recipient_role, content, type || 'normal', expiresAt]
        );

        const newMessage = {
            ...result.rows[0],
            sender_email: req.user.email
        };

        if (global.io) {
            global.io.to(recipient_role).emit('newMessage', newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error sending message: ' + error.message });
    }
};
