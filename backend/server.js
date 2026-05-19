const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production')) {
            return callback(null, true);
        }

        return callback(new Error('Origine CORS non autorisee'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const teacherRoutes = require('./routes/teacher.routes');
const contractRoutes = require('./routes/contract.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const messageRoutes = require('./routes/message.routes');
const platformReviewRoutes = require('./routes/platformReview.routes');

app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/platform-reviews', platformReviewRoutes);

app.get('/', (req, res) => {
    res.send('API AlloProf CI en ligne !');
});

const ensureDefaultAdmin = async () => {
    try {
        if (!process.env.ADMIN_PASSWORD_HASH) {
            console.log('Creation admin automatique desactivee: ADMIN_PASSWORD_HASH manquant.');
            return;
        }

        const adminName = process.env.ADMIN_NAME || 'Administrateur';
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@alloprof.ci';
        const adminPhone = process.env.ADMIN_PHONE || '0000000000';
        const adminCity = process.env.ADMIN_CITY || 'Admin';

        await pool.query(`
            INSERT INTO users (name, email, phone, city, password_hash, role)
            VALUES ($1, $2, $3, $4, $5, 'admin')
            ON CONFLICT (phone) DO UPDATE SET
                email = EXCLUDED.email,
                password_hash = EXCLUDED.password_hash,
                role = 'admin'
        `, [adminName, adminEmail, adminPhone, adminCity, process.env.ADMIN_PASSWORD_HASH]);
        console.log('Compte administrateur pret.');
    } catch (error) {
        console.error("Erreur initialisation admin:", error.message);
    }
};

const PORT = process.env.PORT || 5000;
ensureDefaultAdmin();
app.listen(PORT, () => {
    console.log(`Serveur demarre sur le port ${PORT}`);
});
