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

        const { rows: targets } = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
        if (targets.length === 0) {
            return res.status(404).json({ message: "Utilisateur introuvable." });
        }
        if (targets[0].role === 'admin') {
            return res.status(403).json({ message: "Impossible de supprimer un compte administrateur depuis cette route." });
        }

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
        const { motive } = req.body;

        if (!motive) {
            return res.status(400).json({ message: "Un motif de suppression est requis." });
        }

        const { rows: contracts } = await pool.query(`
            SELECT c.subject, c.parent_id, c.teacher_id, up.email as parent_email, up.name as parent_name, ut.email as teacher_email, ut.name as teacher_name
            FROM contracts c
            JOIN users up ON c.parent_id = up.id
            JOIN users ut ON c.teacher_id = ut.id
            WHERE c.id = $1
        `, [contractId]);

        if (contracts.length > 0) {
            const contract = contracts[0];
            const adminId = req.user.id;
            
            const messageParent = `Votre contrat de cours en ${contract.subject} avec l'enseignant ${contract.teacher_name} a été annulé par l'administration. Motif: ${motive}`;
            const messageTeacher = `Le contrat de cours en ${contract.subject} avec le parent ${contract.parent_name} a été annulé par l'administration. Motif: ${motive}`;

            // Notifier via la messagerie privée (Chat Interne)
            await pool.query('INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)', [adminId, contract.parent_id, messageParent]);
            await pool.query('INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)', [adminId, contract.teacher_id, messageTeacher]);
        }

        await pool.query('DELETE FROM contracts WHERE id = $1', [contractId]);

        res.json({ message: "Contrat supprimé avec succès." });
    } catch (error) {
        console.error("Erreur suppression contrat:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Supprimer un avis plateforme
exports.deletePlatformReview = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé" });
        }

        const reviewId = req.params.id;
        await pool.query('DELETE FROM platform_reviews WHERE id = $1', [reviewId]);

        res.json({ message: "Avis supprimé avec succès." });
    } catch (error) {
        console.error("Erreur suppression avis:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

// Envoyer un message global via notifications
exports.sendGlobalMessage = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: "Accès refusé" });
        }

        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: "Un message est requis." });
        }

        const { rows: users } = await pool.query("SELECT id FROM users WHERE role != 'admin'");
        const finalMessage = message + "\n\n— L'équipe AlloProf CI";
        
        for (const user of users) {
            await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [user.id, finalMessage]);
        }

        res.json({ message: "Message global envoyé avec succès." });
    } catch (error) {
        console.error("Erreur envoi message global:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
