const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { put } = require('@vercel/blob');

const allowedRoles = ['parent', 'teacher'];

exports.register = async (req, res) => {
    try {
        const { name, email, phone, city, password, role, diploma_level, subjects, description, availability_days } = req.body;
        const requestedRole = typeof role === 'string' ? role.trim().toLowerCase() : '';

        if (!allowedRoles.includes(requestedRole)) {
            return res.status(403).json({ message: "Role non autorise" });
        }

        if (requestedRole === 'teacher') {
            if (!req.file) {
                return res.status(400).json({ message: "Une photo de profil est obligatoire pour les enseignants." });
            }

            if (!process.env.BLOB_READ_WRITE_TOKEN) {
                return res.status(500).json({ message: "Upload image non configure. Ajoutez BLOB_READ_WRITE_TOKEN dans les variables d'environnement." });
            }
        }

        const { rows: existingUsers } = await pool.query(
            'SELECT id FROM users WHERE phone = $1 OR email = $2',
            [phone, email]
        );
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Ce numero de telephone ou cet email est deja utilise." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            const { rows: result } = await client.query(
                'INSERT INTO users (name, email, phone, city, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
                [name, email, phone, city, hashedPassword, requestedRole]
            );
            const newUserId = result[0].id;

            if (requestedRole === 'teacher') {
                const blob = await put(`teachers/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
                    access: 'public',
                    token: process.env.BLOB_READ_WRITE_TOKEN
                });

                await client.query(
                    'INSERT INTO teachers_profile (user_id, diploma_level, subjects, profile_picture_url, description, availability_days) VALUES ($1, $2, $3, $4, $5, $6)',
                    [newUserId, diploma_level, subjects || '[]', blob.url, description || '', availability_days || 5]
                );
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

        res.status(201).json({ message: "Compte cree avec succes !" });
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        const { rows: users } = await pool.query(`
            SELECT u.*, tp.diploma_level, tp.subjects, tp.description, tp.profile_picture_url
            FROM users u
            LEFT JOIN teachers_profile tp ON u.id = tp.user_id
            WHERE u.phone = $1 OR u.email = $1
        `, [identifier]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Identifiant ou mot de passe incorrect." });
        }
        const user = users[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Identifiant ou mot de passe incorrect." });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        let subjects = [];
        try {
            subjects = user.subjects ? JSON.parse(user.subjects) : [];
        } catch {
            subjects = [];
        }

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                city: user.city,
                phone: user.phone,
                diploma_level: user.diploma_level,
                subjects,
                description: user.description,
                profile_picture_url: user.profile_picture_url
            }
        });
    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
