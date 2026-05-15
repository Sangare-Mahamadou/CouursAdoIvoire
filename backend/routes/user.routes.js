const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const pool = require('../config/db');
const multer = require('multer');
const { put } = require('@vercel/blob');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const { rows: users } = await pool.query(`
            SELECT u.id, u.name, u.email, u.phone, u.city, u.role,
                   tp.diploma_level, tp.subjects, tp.description, tp.availability_days, tp.profile_picture_url
            FROM users u
            LEFT JOIN teachers_profile tp ON u.id = tp.user_id
            WHERE u.id = $1
        `, [req.user.id]);

        if (users.length === 0) {
            return res.status(404).json({ message: "Profil introuvable." });
        }

        const user = users[0];
        let subjects = [];
        try {
            subjects = user.subjects ? JSON.parse(user.subjects) : [];
        } catch {
            subjects = [];
        }

        res.json({ ...user, subjects });
    } catch (error) {
        console.error("Erreur récupération profil:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.put('/profile', authMiddleware, upload.single('profile_picture'), async (req, res) => {
    try {
        const { name, phone, email, city, diploma_level, subjects, description, availability_days } = req.body;
        const userId = req.user.id;

        const { rows: existingUsers } = await pool.query(
            'SELECT id FROM users WHERE (phone = $1 OR email = $2) AND id != $3',
            [phone, email, userId]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Ce numéro de téléphone ou cet email est déjà utilisé par un autre compte." });
        }

        await pool.query(
            'UPDATE users SET name = $1, phone = $2, email = $3, city = $4 WHERE id = $5',
            [name, phone, email, city, userId]
        );

        if (req.user.role === 'teacher') {
            let profilePictureUrl = null;
            if (req.file) {
                const blob = await put(`teachers/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
                    access: 'public',
                    token: process.env.BLOB_READ_WRITE_TOKEN
                });
                profilePictureUrl = blob.url;
            }

            const fields = [
                'diploma_level = $1',
                'subjects = $2',
                'description = $3',
                'availability_days = $4'
            ];
            const values = [diploma_level, subjects || '[]', description || '', availability_days || 5, userId];

            if (profilePictureUrl) {
                fields.push('profile_picture_url = $6');
                values.push(profilePictureUrl);
            }

            await pool.query(
                `UPDATE teachers_profile SET ${fields.join(', ')} WHERE user_id = $5`,
                values
            );
        }

        res.json({ message: "Profil mis à jour avec succès." });
    } catch (error) {
        console.error("Erreur mise à jour profil:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const { rows } = await pool.query(
            'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(rows);
    } catch (error) {
        console.error("Erreur récupération notifications:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
