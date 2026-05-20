const nodemailer = require('nodemailer');

// Configuration du transporteur Nodemailer
// Utilise les variables d'environnement en priorité pour la production
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_PORT == 465, // true si le port est 465 (SSL), false sinon (TLS)
    auth: {
        user: process.env.SMTP_USER || 'test@ethereal.email',
        pass: process.env.SMTP_PASSWORD || 'testpassword'
    }
});

// Fonction utilitaire pour envoyer un e-mail
const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: process.env.SMTP_USER ? `"AlloProf CI" <${process.env.SMTP_USER}>` : '"AlloProf CI" <noreply@alloprof.ci>',
            to,
            subject,
            text,
            html
        };

        // En développement, s'il n'y a pas de configuration SMTP, on log simplement l'email
        if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASSWORD) {
            console.log('\n--- SIMULATION ENVOI E-MAIL ---');
            console.log('À:', to);
            console.log('Sujet:', subject);
            console.log('Texte:\n', text);
            console.log('-------------------------------\n');
            return true;
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail envoyé avec succès: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
        return false;
    }
};

module.exports = { sendEmail };
