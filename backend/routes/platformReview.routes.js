const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const pool = require('../config/db');

// Récupérer tous les avis
router.get('/', async (req, res) => {
    try {
        const { rows } = await pool.query(`
            SELECT pr.*, u.name as author_name 
            FROM platform_reviews pr
            JOIN users u ON pr.author_id = u.id
            ORDER BY pr.created_at DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Ajouter un avis
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating) return res.status(400).json({ message: "La note est obligatoire" });
        
        await pool.query(
            'INSERT INTO platform_reviews (author_id, rating, comment) VALUES ($1, $2, $3)',
            [req.user.id, rating, comment]
        );
        res.status(201).json({ message: "Avis ajouté avec succès" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
