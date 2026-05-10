const nodemailer = require('nodemailer');

// Configuration du transporteur Nodemailer (Mode développement / Console)
// En production, il faudra remplacer par de vrais identifiants (ex: Gmail, SendGrid, Resend)
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'test@ethereal.email', // Faux compte de test (sera remplacé en prod)
        pass: 'testpassword'
    }
});

// Fonction utilitaire pour envoyer un e-mail
const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: '"AlloProf CI" <noreply@alloprof.ci>',
            to,
            subject,
            text,
            html
        };

        // En développement (si pas de vrais identifiants SMTP), on log simplement l'email
        if (process.env.NODE_ENV !== 'production' && !process.env.SMTP_PASSWORD) {
            console.log('\n--- SIMULATION ENVOI E-MAIL ---');
            console.log('À:', to);
            console.log('Sujet:', subject);
            console.log('Texte:\n', text);
            console.log('-------------------------------\n');
            return true;
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('E-mail envoyé: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail:', error);
        return false;
    }
};

module.exports = { sendEmail };
