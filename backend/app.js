const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || '')
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        const isVercelPreview = origin && /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

        if (
            !origin ||
            allowedOrigins.includes(origin) ||
            isVercelPreview ||
            (allowedOrigins.length === 0 && process.env.NODE_ENV !== 'production')
        ) {
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

let adminInitializationPromise = null;

const ensureSchema = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            phone VARCHAR(20) NOT NULL UNIQUE,
            city VARCHAR(100) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) CHECK (role IN ('parent', 'teacher', 'admin')) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS teachers_profile (
            user_id INT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
            diploma_level VARCHAR(50) NOT NULL,
            subjects TEXT DEFAULT '',
            description TEXT,
            availability_days INT DEFAULT 5,
            rating DECIMAL(3, 1) DEFAULT 0.0,
            reviews_count INT DEFAULT 0,
            profile_picture_url VARCHAR(255) NOT NULL
        );

        CREATE TABLE IF NOT EXISTS contracts (
            id SERIAL PRIMARY KEY,
            parent_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            child_name VARCHAR(255),
            children_count INT DEFAULT 1,
            class_level VARCHAR(50),
            subject VARCHAR(100) NOT NULL,
            hours_per_week INT NOT NULL,
            hourly_rate INT NOT NULL,
            status VARCHAR(20) CHECK (status IN ('pending', 'active', 'rejected', 'completed')) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            teacher_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (teacher_id, author_id)
        );

        CREATE TABLE IF NOT EXISTS platform_reviews (
            id SERIAL PRIMARY KEY,
            author_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            sender_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            receiver_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

const ensureDefaultAdmin = async () => {
    if (adminInitializationPromise) return adminInitializationPromise;

    adminInitializationPromise = (async () => {
        try {
            await ensureSchema();

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
                    name = EXCLUDED.name,
                    email = EXCLUDED.email,
                    password_hash = EXCLUDED.password_hash,
                    role = 'admin'
            `, [adminName, adminEmail, adminPhone, adminCity, process.env.ADMIN_PASSWORD_HASH]);
            console.log('Compte administrateur pret.');
        } catch (error) {
            console.error("Erreur initialisation admin:", error.message);
        }
    })();

    return adminInitializationPromise;
};

app.use(async (req, res, next) => {
    try {
        await ensureDefaultAdmin();
        next();
    } catch (error) {
        console.error('Erreur initialisation API:', error.message);
        res.status(500).json({ message: "Erreur d'initialisation de l'API." });
    }
});

app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/platform-reviews', platformReviewRoutes);

app.get('/api', (req, res) => {
    res.send('API AlloProf CI en ligne !');
});

app.get('/', (req, res) => {
    res.send('API AlloProf CI en ligne !');
});

ensureDefaultAdmin();

module.exports = app;
