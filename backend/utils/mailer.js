// Utilisation de l'API HTTP Brevo (Sendinblue) au lieu de Nodemailer
// Cela permet de contourner les blocages SMTP de Render (ports 465/587).

const sendEmail = async (to, subject, text, customHtml = null) => {
    try {
        const BREVO_API_KEY = process.env.BREVO_API_KEY;
        const SENDER_EMAIL = process.env.SENDER_EMAIL || 'noreply@alloprof.ci';
        const SENDER_NAME = "AlloProf CI";

        // Si l'API Key n'est pas configurée, on simule l'envoi dans la console
        if (!BREVO_API_KEY && process.env.NODE_ENV !== 'production') {
            console.log('\n--- SIMULATION ENVOI E-MAIL (Brevo API) ---');
            console.log('À:', to);
            console.log('Sujet:', subject);
            console.log('Texte:\n', text);
            console.log('-------------------------------------------\n');
            return true;
        }

        // Création du beau gabarit (template) HTML professionnel
        const htmlContent = customHtml || `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
                    .header { background-color: #ea580c; padding: 25px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; }
                    .content { padding: 30px; color: #374151; font-size: 16px; line-height: 1.6; }
                    .content p { margin-bottom: 15px; }
                    .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
                    .footer p { margin: 5px 0; }
                    .signature { font-weight: 700; color: #ea580c; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>AlloProfCI</h1>
                    </div>
                    <div class="content">
                        ${text.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('')}
                    </div>
                    <div class="footer">
                        <p>Cordialement,</p>
                        <p class="signature">L'équipe AlloProfCI</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': BREVO_API_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: SENDER_NAME, email: SENDER_EMAIL },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlContent,
                textContent: text // Solution de repli au cas où le client mail bloque le HTML
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erreur API Brevo:', errorData);
            return false;
        }

        console.log(`E-mail envoyé avec succès à ${to} via Brevo.`);
        return true;
    } catch (error) {
        console.error('Erreur lors de l\'envoi de l\'e-mail:', error.message);
        return false;
    }
};

module.exports = { sendEmail };
