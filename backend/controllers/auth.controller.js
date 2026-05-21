const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { put } = require('@vercel/blob');
const { sendEmail } = require('../utils/mailer');

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

exports.forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "L'adresse email est obligatoire." });
        }
        
        email = email.trim().toLowerCase();

        // 1. Supprimer les anciens codes expirés
        await pool.query("DELETE FROM password_resets WHERE expires_at < NOW()");

        // 2. Limiter le spam : max 3 demandes par minute
        const { rows: spamCheck } = await pool.query(
            "SELECT count(*) FROM password_resets WHERE email = $1 AND created_at > NOW() - INTERVAL '1 minute'",
            [email]
        );
        if (parseInt(spamCheck[0].count, 10) >= 3) {
            console.warn(`[SECURITY WARNING] [SPAM LIMIT] Too many password reset requests for email: ${email}`);
            return res.status(429).json({ message: "Trop de demandes. Veuillez patienter une minute avant de réessayer." });
        }

        // 3. Désactiver automatiquement les anciens codes actifs
        await pool.query(
            "UPDATE password_resets SET used = true WHERE email = $1 AND used = false",
            [email]
        );

        // 4. Vérifier si l'email existe dans la base de données
        const { rows: users } = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        const genericMessage = "Si un compte existe avec cet email, un code a été envoyé.";

        if (users.length === 0) {
            // Pour éviter l'énumération, on insère quand même une ligne expirée/utilisée en base pour tracker le rate limit.
            await pool.query(
                "INSERT INTO password_resets (email, code, expires_at, used) VALUES ($1, $2, NOW(), true)",
                [email, '000000']
            );
            return res.status(200).json({ message: genericMessage });
        }

        // 5. Générer un code OTP aléatoire de 6 chiffres
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // 6. Expiration dans 10 minutes
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // 7. Sauvegarder ce code en base
        await pool.query(
            "INSERT INTO password_resets (email, code, expires_at, used) VALUES ($1, $2, $3, false)",
            [email, otpCode, expiresAt]
        );

        // 8. Envoyer l'email
        const subject = "Réinitialisation de votre mot de passe - AlloProf CI";
        const text = `Bonjour,\n\nVous avez demandé la réinitialisation de votre mot de passe.\nVoici votre code de validation OTP : ${otpCode}\nCe code est valable pendant 10 minutes.\nSi vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.\n\nCordialement,\nL'équipe AlloProf CI`;
        
        const customHtml = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
                    .header { background: linear-gradient(135deg, #f26822, #009e60); padding: 30px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px; }
                    .content { padding: 40px 30px; color: #1f2937; font-size: 16px; line-height: 1.7; }
                    .content p { margin-bottom: 20px; }
                    .otp-box { background-color: #f3f4f6; border-radius: 8px; padding: 15px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 5px; color: #f26822; margin: 25px 0; border: 1px dashed #e2e8f0; }
                    .security-notice { background-color: #fef3c7; border-left: 4px solid #f59e0b; color: #78350f; padding: 15px; border-radius: 4px; font-size: 14px; margin-top: 30px; }
                    .footer { background-color: #f9fafb; padding: 25px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
                    .footer p { margin: 5px 0; }
                    .signature { font-weight: 700; color: #f26822; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>AlloProf CI</h1>
                    </div>
                    <div class="content">
                        <p>Bonjour,</p>
                        <p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte sur <strong>AlloProf CI</strong>.</p>
                        <p>Veuillez utiliser le code de vérification OTP ci-dessous pour finaliser l'opération :</p>
                        <div class="otp-box">${otpCode}</div>
                        <p>Ce code est valable pour une durée de <strong>10 minutes</strong>.</p>
                        <div class="security-notice">
                            <strong>Message de sécurité :</strong> Si vous n'avez pas demandé ce code, quelqu'un a peut-être saisi votre adresse email par erreur. Vous pouvez ignorer cet e-mail en toute sécurité et votre mot de passe restera inchangé. Ne partagez jamais ce code avec qui que ce soit.
                        </div>
                    </div>
                    <div class="footer">
                        <p>Cordialement,</p>
                        <p class="signature">L'équipe AlloProf CI</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        await sendEmail(email, subject, text, customHtml);

        return res.status(200).json({ message: genericMessage });
    } catch (error) {
        console.error("Erreur lors de la demande de mot de passe oublié:", error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

exports.verifyResetCode = async (req, res) => {
    try {
        let { email, code, password, confirmPassword } = req.body;
        if (!email || !code || !password) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires." });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Les mots de passe ne correspondent pas." });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères." });
        }

        email = email.trim().toLowerCase();
        code = code.trim();

        // 1. Supprimer les anciens codes expirés
        await pool.query("DELETE FROM password_resets WHERE expires_at < NOW()");

        // 2. Vérifier si le code existe, correspond à l'email, n'est pas expiré et n'a pas déjà été utilisé
        const { rows: resetRequests } = await pool.query(
            "SELECT * FROM password_resets WHERE email = $1 AND code = $2 AND used = false AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1",
            [email, code]
        );

        if (resetRequests.length === 0) {
            console.warn(`[SECURITY WARNING] [SUSPICIOUS ATTEMPT] Failed password reset code verification for email: ${email}. Code entered: ${code}.`);
            return res.status(400).json({ message: "Code de réinitialisation invalide ou expiré." });
        }

        const resetRequest = resetRequests[0];

        // 3. Récupérer l'utilisateur
        const { rows: users } = await pool.query(`
            SELECT u.*, tp.diploma_level, tp.subjects, tp.description, tp.profile_picture_url
            FROM users u
            LEFT JOIN teachers_profile tp ON u.id = tp.user_id
            WHERE u.email = $1
        `, [email]);

        if (users.length === 0) {
            console.warn(`[SECURITY WARNING] Verified OTP but user email ${email} no longer exists.`);
            return res.status(404).json({ message: "Utilisateur non trouvé." });
        }

        const user = users[0];

        // 4. Hasher le nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 5. Mettre à jour le mot de passe de l'utilisateur
        await pool.query(
            "UPDATE users SET password_hash = $1 WHERE id = $2",
            [hashedPassword, user.id]
        );

        // 6. Marquer le code comme utilisé
        await pool.query(
            "UPDATE password_resets SET used = true WHERE id = $1",
            [resetRequest.id]
        );

        // 7. Connexion automatique de l'utilisateur (génération du token JWT)
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

        console.log(`[SUCCESS] Password successfully reset and user auto-logged in for email: ${email}`);

        return res.json({
            message: "Votre mot de passe a été réinitialisé avec succès !",
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
        console.error("Erreur lors de la vérification du code de réinitialisation:", error);
        return res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
