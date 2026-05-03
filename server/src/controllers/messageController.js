import { query } from '../config/db.js';

export const getMessages = async (req, res) => {
    try {
        const { role } = req.user;
        const { all } = req.query;
        
        // Filter: (No expiry AND created in last 24h) OR (Expiry exists AND not yet reached)
        const filterClause = all === 'true' ? '1=1' : `
            (expires_at IS NULL AND created_at >= NOW() - INTERVAL '24 hours') 
            OR 
            (expires_at IS NOT NULL AND expires_at > NOW())
        `;

        let result;
        console.log(`Fetching messages for role: ${role}, user: ${req.user.id}`);
        if (role === 'admin') {
            result = await query(`
                SELECT m.id, m.content, m.type, m.created_at, m.expires_at, m.recipient_role, u.email as sender_email
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE ${filterClause}
                ORDER BY m.created_at DESC
            `);
        } else {
            result = await query(`
                SELECT m.id, m.content, m.type, m.created_at, m.expires_at, u.email as sender_email
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE (${filterClause}) AND (m.recipient_role = $1 OR m.sender_id = $2)
                ORDER BY m.created_at DESC
            `, [role, req.user.id]);
        }
        console.log(`Found ${result.rows.length} messages`);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching messages' });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { content, type, recipient_role, expiresAt } = req.body;
        const sender_id = req.user.id;

        if (!content || !recipient_role) {
            return res.status(400).json({ message: 'Content and recipient role are required' });
        }

        // Role-based validation
        if (req.user.role === 'staff' && !['admin', 'user'].includes(recipient_role)) {
            return res.status(403).json({ message: 'Staff can only send messages to the Administrator or Students' });
        }

        const result = await query(
            'INSERT INTO messages (sender_id, recipient_role, content, type, expires_at) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [sender_id, recipient_role, content, type || 'normal', expiresAt || null]
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
