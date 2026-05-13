const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { put } = require('@vercel/blob');

exports.register = async (req, res) => {
    try {
        const { name, email, phone, city, password, role, diploma_level, subjects, description, availability_days } = req.body;

        // 1. Vérifier si l'utilisateur existe déjà
        const { rows: existingUsers } = await pool.query('SELECT id FROM users WHERE phone = $1 OR email = $2', [phone, email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Ce numéro de téléphone ou cet email est déjà utilisé." });
        }

        // 2. Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insérer dans la table "users"
        const { rows: result } = await pool.query(
            'INSERT INTO users (name, email, phone, city, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [name, email, phone, city, hashedPassword, role]
        );
        const newUserId = result[0].id;

        // 4. Si c'est un enseignant, gérer l'upload et insérer dans la table profil
        if (role === 'teacher') {
            if (!req.file) {
                return res.status(400).json({ message: "Une photo de profil est obligatoire pour les enseignants." });
            }

            // Upload de l'image sur Vercel Blob
            const blob = await put(`teachers/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
                access: 'public',
                token: process.env.BLOB_READ_WRITE_TOKEN
            });

            await pool.query(
                'INSERT INTO teachers_profile (user_id, diploma_level, subjects, profile_picture_url, description, availability_days) VALUES ($1, $2, $3, $4, $5, $6)',
                [newUserId, diploma_level, subjects || '[]', blob.url, description || '', availability_days || 5]
            );
        }

        res.status(201).json({ message: "Compte créé avec succès !" });

    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        // 1. Trouver l'utilisateur (par email ou téléphone) avec son profil s'il est enseignant
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

        // 2. Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Identifiant ou mot de passe incorrect." });
        }

        // 3. Créer le Token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name, email: user.email },
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
