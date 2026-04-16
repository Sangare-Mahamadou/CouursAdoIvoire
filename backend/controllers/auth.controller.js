const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.register = async (req, res) => {
    try {
        const { name, phone, city, password, role, diploma_level, hourly_rate, subjects } = req.body;

        // 1. Vérifier si l'utilisateur existe déjà
        const [existingUsers] = await pool.query('SELECT id FROM users WHERE phone = ?', [phone]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Ce numéro de téléphone est déjà utilisé." });
        }

        // 2. Hasher le mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Insérer dans la table "users"
        const [result] = await pool.query(
            'INSERT INTO users (name, phone, city, password_hash, role) VALUES (?, ?, ?, ?, ?)',
            [name, phone, city, hashedPassword, role]
        );
        const newUserId = result.insertId;

        // 4. Si c'est un enseignant, insérer dans la table profil
        if (role === 'teacher') {
            await pool.query(
                'INSERT INTO teachers_profile (user_id, diploma_level, hourly_rate, subjects) VALUES (?, ?, ?, ?)',
                [newUserId, diploma_level, hourly_rate, subjects || '']
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
        const { phone, password } = req.body;

        // 1. Trouver l'utilisateur
        const [users] = await pool.query('SELECT * FROM users WHERE phone = ?', [phone]);
        if (users.length === 0) {
            return res.status(400).json({ message: "Numéro de téléphone ou mot de passe incorrect." });
        }
        const user = users[0];

        // 2. Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: "Numéro de téléphone ou mot de passe incorrect." });
        }

        // 3. Créer le Token JWT
        const token = jwt.sign(
            { id: user.id, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role, city: user.city } });

    } catch (error) {
        console.error("Erreur lors de la connexion:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
