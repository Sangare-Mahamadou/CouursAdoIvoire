const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
const teacherRoutes = require('./routes/teacher.routes');
const contractRoutes = require('./routes/contract.routes');
const adminRoutes = require('./routes/admin.routes');
const userRoutes = require('./routes/user.routes');
const messageRoutes = require('./routes/message.routes');

app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
const platformReviewRoutes = require('./routes/platformReview.routes');
app.use('/api/platform-reviews', platformReviewRoutes);

app.get('/', (req, res) => {
    res.send('API AlloProf CI en ligne !');
});

const ensureDefaultAdmin = async () => {
    try {
        await pool.query(`
            INSERT INTO users (name, email, phone, city, password_hash, role)
            VALUES ('Administrateur', 'admin@alloprof.ci', '0000000000', 'Admin', '$2b$10$MoSARlQC9hjQYpg9AjUM2uTHlArymaB25.dLwHV3pzvCAyvfk9tMy', 'admin')
            ON CONFLICT (phone) DO UPDATE SET
                email = EXCLUDED.email,
                password_hash = EXCLUDED.password_hash,
                role = 'admin'
        `);
        console.log('Compte administrateur prêt : 0000000000 / sangmah');
    } catch (error) {
        console.error("Erreur initialisation admin:", error.message);
    }
};

const PORT = process.env.PORT || 5000;
ensureDefaultAdmin();
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});
