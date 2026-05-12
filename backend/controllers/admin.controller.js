const pool = require('../config/db');

// Récupérer tous les utilisateurs
exports.getAllUsers = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé" });
        }

        const { rows: users } = await pool.query(`
            SELECT id, name, phone, city, role, created_at 
            FROM users 
            WHERE role != 'admin'
            ORDER BY created_at DESC
        `);

        res.json(users);
    } catch (error) {
        console.error("Erreur récupération utilisateurs:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé" });
        }

        const userId = req.params.id;

        await pool.query('DELETE FROM users WHERE id = $1', [userId]);

        res.json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
        console.error("Erreur suppression utilisateur:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Récupérer toutes les relations (contrats)
exports.getAllContracts = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé" });
        }

        const { rows: contracts } = await pool.query(`
            SELECT c.*, 
                   up.name as parent_name, 
                   ut.name as teacher_name
            FROM contracts c
            JOIN users up ON c.parent_id = up.id
            JOIN users ut ON c.teacher_id = ut.id
            ORDER BY c.created_at DESC
        `);

        res.json(contracts);
    } catch (error) {
        console.error("Erreur récupération des contrats:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Supprimer un contrat
exports.deleteContract = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé" });
        }

        const contractId = req.params.id;
        await pool.query('DELETE FROM contracts WHERE id = $1', [contractId]);

        res.json({ message: "Contrat supprimé avec succès." });
    } catch (error) {
        console.error("Erreur suppression contrat:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
