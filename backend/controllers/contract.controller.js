const pool = require('../config/db');

// Parent demande un contrat
exports.createContract = async (req, res) => {
    try {
        const { teacher_id, children_count, class_level, subject, hours_per_week, hourly_rate } = req.body;
        const parent_id = req.user.id; // Issu du authMiddleware

        if (req.user.role !== 'parent') {
            return res.status(403).json({ message: "Seul un parent peut faire une demande." });
        }

        const [result] = await pool.query(
            `INSERT INTO contracts (parent_id, teacher_id, children_count, class_level, subject, hours_per_week, hourly_rate, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [parent_id, teacher_id, children_count, class_level, subject, hours_per_week, hourly_rate]
        );

        res.status(201).json({ message: "Demande envoyée avec succès", contractId: result.insertId });
    } catch (error) {
        console.error("Erreur création contrat:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Récupérer les contrats de l'utilisateur connecté
exports.getMyContracts = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let query = '';

        if (userRole === 'parent') {
            query = `
                SELECT c.*, u.name as teacher_name, tp.diploma_level
                FROM contracts c
                JOIN users u ON c.teacher_id = u.id
                LEFT JOIN teachers_profile tp ON u.id = tp.user_id
                WHERE c.parent_id = ?
                ORDER BY c.created_at DESC
            `;
        } else if (userRole === 'teacher') {
            query = `
                SELECT c.*, u.name as parent_name, u.phone as parent_phone
                FROM contracts c
                JOIN users u ON c.parent_id = u.id
                WHERE c.teacher_id = ?
                ORDER BY c.created_at DESC
            `;
        }

        const [contracts] = await pool.query(query, [userId]);
        res.json(contracts);
    } catch (error) {
        console.error("Erreur récupération contrats:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Professeur accepte/refuse un contrat
exports.updateContractStatus = async (req, res) => {
    try {
        const contractId = req.params.id;
        const { status } = req.body; // 'active' ou 'rejected'
        const teacherId = req.user.id;

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: "Seul l'enseignant peut modifier le statut." });
        }

        // Vérifier si le contrat appartient bien à ce professeur
        const [contracts] = await pool.query('SELECT id FROM contracts WHERE id = ? AND teacher_id = ?', [contractId, teacherId]);
        if (contracts.length === 0) {
            return res.status(404).json({ message: "Contrat introuvable ou non autorisé." });
        }

        await pool.query('UPDATE contracts SET status = ? WHERE id = ?', [status, contractId]);
        
        res.json({ message: `Le statut a été mis à jour avec succès : ${status}` });
    } catch (error) {
        console.error("Erreur mise à jour statut contrat:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
