const pool = require('../config/db');
const { sendEmail } = require('../utils/mailer');

exports.createContract = async (req, res) => {
    try {
        const { teacher_id, selections } = req.body;
        const parent_id = req.user.id;

        if (req.user.role !== 'parent') {
            return res.status(403).json({ message: "Seul un parent peut faire une demande." });
        }

        const { rows: recentContracts } = await pool.query(
            `SELECT id FROM contracts
             WHERE parent_id = $1 AND teacher_id = $2
             AND created_at > NOW() - INTERVAL '1 month'`,
            [parent_id, teacher_id]
        );

        if (recentContracts.length > 0) {
            return res.status(400).json({ message: "Vous avez déjà contacté cet enseignant il y a moins d'un mois." });
        }

        const requestedSubjects = [];

        if (selections && selections.length > 0) {
            for (const sel of selections) {
                requestedSubjects.push(sel.subject);
                await pool.query(
                    `INSERT INTO contracts (parent_id, teacher_id, children_count, class_level, subject, hours_per_week, hourly_rate, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
                    [parent_id, teacher_id, sel.children_count, sel.class_level, sel.subject, sel.hours_per_week, sel.hourly_rate]
                );
            }
        } else {
            const { children_count, class_level, subject, hours_per_week, hourly_rate } = req.body;
            requestedSubjects.push(subject);
            await pool.query(
                `INSERT INTO contracts (parent_id, teacher_id, children_count, class_level, subject, hours_per_week, hourly_rate, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')`,
                [parent_id, teacher_id, children_count, class_level, subject, hours_per_week, hourly_rate]
            );
        }

        const { rows: teachers } = await pool.query('SELECT email, name FROM users WHERE id = $1', [teacher_id]);
        if (teachers.length > 0) {
            const teacher = teachers[0];
            sendEmail(
                teacher.email,
                'Nouvelle demande de cours - AlloProf CI',
                `Bonjour ${teacher.name},\n\nVous avez reçu une nouvelle demande de cours pour : ${requestedSubjects.join(', ')}.\nVeuillez vous connecter à votre espace pour la consulter et l'accepter ou la refuser.\n\nCordialement,\nL'équipe AlloProf CI`
            ).catch(err => console.error("Erreur d'envoi d'e-mail:", err));
        }

        res.status(201).json({ message: "Demande envoyée avec succès" });
    } catch (error) {
        console.error("Erreur création contrat:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.getMyContracts = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        let query = '';

        if (userRole === 'parent') {
            query = `
                SELECT c.*, u.name as teacher_name,
                       CASE WHEN c.status = 'active' THEN u.phone ELSE 'Masqué' END as teacher_phone,
                       CASE WHEN c.status = 'active' THEN u.email ELSE 'Masqué' END as teacher_email,
                       tp.diploma_level
                FROM contracts c
                JOIN users u ON c.teacher_id = u.id
                LEFT JOIN teachers_profile tp ON u.id = tp.user_id
                WHERE c.parent_id = $1
                ORDER BY c.created_at DESC
            `;
        } else if (userRole === 'teacher') {
            query = `
                SELECT c.*, u.name as parent_name,
                       CASE WHEN c.status = 'active' THEN u.phone ELSE 'Masqué' END as parent_phone,
                       CASE WHEN c.status = 'active' THEN u.email ELSE 'Masqué' END as parent_email
                FROM contracts c
                JOIN users u ON c.parent_id = u.id
                WHERE c.teacher_id = $1
                ORDER BY c.created_at DESC
            `;
        } else {
            return res.status(403).json({ message: "Rôle non autorisé." });
        }

        const { rows: contracts } = await pool.query(query, [userId]);
        res.json(contracts);
    } catch (error) {
        console.error("Erreur récupération contrats:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.updateContractStatus = async (req, res) => {
    try {
        const contractId = req.params.id;
        const { status } = req.body;
        const teacherId = req.user.id;

        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: "Seul l'enseignant peut modifier le statut." });
        }

        const { rows: contracts } = await pool.query(
            'SELECT c.id, c.subject, u.email, u.name as parent_name FROM contracts c JOIN users u ON c.parent_id = u.id WHERE c.id = $1 AND c.teacher_id = $2',
            [contractId, teacherId]
        );

        if (contracts.length === 0) {
            return res.status(404).json({ message: "Contrat introuvable ou non autorisé." });
        }

        const contract = contracts[0];
        await pool.query('UPDATE contracts SET status = $1 WHERE id = $2', [status, contractId]);

        const statusText = status === 'active' ? 'acceptée' : 'refusée';
        sendEmail(
            contract.email,
            `Mise à jour de votre demande - AlloProf CI`,
            `Bonjour ${contract.parent_name},\n\nVotre demande de cours en ${contract.subject} a été ${statusText} par l'enseignant.\n\nConnectez-vous à votre espace pour plus de détails.\n\nCordialement,\nL'équipe AlloProf CI`
        ).catch(err => console.error("Erreur d'envoi d'e-mail:", err));

        res.json({ message: `Le statut a été mis à jour avec succès : ${status}` });
    } catch (error) {
        console.error("Erreur mise à jour statut contrat:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.rateTeacher = async (req, res) => {
    try {
        const contractId = req.params.id;
        const { rating } = req.body;
        const parentId = req.user.id;

        if (req.user.role !== 'parent') {
            return res.status(403).json({ message: "Seul un parent peut noter." });
        }

        const { rows: contracts } = await pool.query(
            'SELECT teacher_id, status FROM contracts WHERE id = $1 AND parent_id = $2',
            [contractId, parentId]
        );

        if (contracts.length === 0 || contracts[0].status !== 'active') {
            return res.status(400).json({ message: "Contrat introuvable ou vous ne pouvez pas le noter." });
        }

        const teacherId = contracts[0].teacher_id;
        
        // La logique de notation est maintenant gérée par les avis (addReview)
        // On marque juste le contrat comme terminé
        await pool.query("UPDATE contracts SET status = 'completed' WHERE id = $1", [contractId]);

        res.json({ message: "Contrat marqué comme terminé." });
    } catch (error) {
        console.error("Erreur notation:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.addReview = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const { rating, comment } = req.body;
        const authorId = req.user.id;

        if (req.user.role !== 'parent') {
            return res.status(403).json({ message: "Seul un parent peut laisser un avis." });
        }

        // Optionnel : vérifier si le parent a déjà eu un contrat avec ce prof
        const { rows: contracts } = await pool.query(
            'SELECT id FROM contracts WHERE parent_id = $1 AND teacher_id = $2 AND status IN ($3, $4)',
            [authorId, teacherId, 'active', 'completed']
        );

        if (contracts.length === 0) {
            return res.status(403).json({ message: "Vous devez avoir eu un contrat avec cet enseignant pour laisser un avis." });
        }

        // Insérer l'avis
        await pool.query(
            'INSERT INTO reviews (teacher_id, author_id, rating, comment) VALUES ($1, $2, $3, $4)',
            [teacherId, authorId, rating, comment]
        );

        // Mettre à jour la note moyenne et le nombre d'avis de l'enseignant
        await pool.query(`
            UPDATE teachers_profile
            SET 
                reviews_count = (SELECT COUNT(*) FROM reviews WHERE teacher_id = $1),
                rating = (SELECT AVG(rating) FROM reviews WHERE teacher_id = $1)
            WHERE user_id = $1
        `, [teacherId]);

        res.status(201).json({ message: "Avis ajouté avec succès." });
    } catch (error) {
        console.error("Erreur ajout d'avis:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
