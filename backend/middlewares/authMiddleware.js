const jwt = require('jsonwebtoken');
const pool = require('../config/db');

module.exports = async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Acces refuse, token manquant." });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const { rows } = await pool.query(
            'SELECT id, name, email, phone, city, role FROM users WHERE id = $1',
            [verified.id]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Utilisateur introuvable." });
        }

        // Source de verite: le role vient de la base, jamais du token ni du frontend.
        req.user = rows[0];
        next();
    } catch (error) {
        console.error("Erreur authentification:", error.message);
        res.status(401).json({ message: "Token invalide." });
    }
};
