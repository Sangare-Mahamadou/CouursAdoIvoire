const pool = require('../config/db');
const { sendEmail } = require('../utils/mailer');

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
            
            const messageParent = `Votre contrat de cours en ${contract.subject} avec l'enseignant ${contract.teacher_name} a été annulé. Motif: ${motive}`;
            const messageTeacher = `Le contrat de cours en ${contract.subject} avec le parent ${contract.parent_name} a été annulé. Motif: ${motive}`;

            // Insert notifications
            await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [contract.parent_id, messageParent]);
            await pool.query('INSERT INTO notifications (user_id, message) VALUES ($1, $2)', [contract.teacher_id, messageTeacher]);

            // Notification au parent
            sendEmail(
                contract.parent_email,
                'Annulation de contrat - AlloProf CI',
                `Bonjour ${contract.parent_name},\n\n${messageParent}\n\nCordialement,\nL'équipe AlloProf CI`
            ).catch(err => console.error("Erreur d'envoi d'e-mail:", err));

            // Notification à l'enseignant
            sendEmail(
                contract.teacher_email,
                'Annulation de contrat - AlloProf CI',
                `Bonjour ${contract.teacher_name},\n\n${messageTeacher}\n\nCordialement,\nL'équipe AlloProf CI`
            ).catch(err => console.error("Erreur d'envoi d'e-mail:", err));
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
