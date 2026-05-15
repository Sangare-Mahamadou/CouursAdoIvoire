const pool = require('../config/db');

exports.sendMessage = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId, content } = req.body;

        if (!receiverId || !content) {
            return res.status(400).json({ message: "Le destinataire et le contenu sont requis." });
        }

        const { rows } = await pool.query(
            'INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3) RETURNING *',
            [senderId, receiverId, content]
        );

        res.status(201).json(rows[0]);
    } catch (error) {
        console.error("Erreur d'envoi du message:", error);
        res.status(500).json({ message: "Erreur serveur lors de l'envoi du message." });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;
        const otherUserId = req.params.userId;

        const { rows } = await pool.query(`
            SELECT * FROM messages
            WHERE (sender_id = $1 AND receiver_id = $2)
               OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY created_at ASC
        `, [userId, otherUserId]);

        // Marquer comme lu
        await pool.query(`
            UPDATE messages
            SET is_read = TRUE
            WHERE receiver_id = $1 AND sender_id = $2 AND is_read = FALSE
        `, [userId, otherUserId]);

        res.json(rows);
    } catch (error) {
        console.error("Erreur de récupération des messages:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des messages." });
    }
};

exports.getContacts = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        let query = '';

        if (userRole === 'parent') {
            query = `
                SELECT DISTINCT u.id, u.name, u.role, tp.profile_picture_url
                FROM users u
                JOIN contracts c ON c.teacher_id = u.id
                LEFT JOIN teachers_profile tp ON u.id = tp.user_id
                WHERE c.parent_id = $1 AND c.status IN ('active', 'completed')
            `;
        } else if (userRole === 'teacher') {
            query = `
                SELECT DISTINCT u.id, u.name, u.role, NULL as profile_picture_url
                FROM users u
                JOIN contracts c ON c.parent_id = u.id
                WHERE c.teacher_id = $1 AND c.status IN ('active', 'completed')
            `;
        } else if (userRole === 'admin') {
            // Admin can see everyone ? For now let's just allow admin to get teachers and parents
            query = `
                SELECT id, name, role, NULL as profile_picture_url
                FROM users
                WHERE role != 'admin'
            `;
        }

        const { rows } = await pool.query(query, [userId]);
        
        res.json(rows);

    } catch (error) {
        console.error("Erreur de récupération des contacts:", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération des contacts." });
    }
};

exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;
        const { rows } = await pool.query(
            'SELECT COUNT(*) FROM messages WHERE receiver_id = $1 AND is_read = FALSE',
            [userId]
        );
        res.json({ count: parseInt(rows[0].count) });
    } catch (error) {
        console.error("Erreur count:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
