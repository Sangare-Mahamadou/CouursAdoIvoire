const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialisation de Express
const app = express();

// Middlewares
app.use(cors()); // Pour autoriser React à faire des requêtes
app.use(express.json()); // Pour lire le JSON envoyé par le Front-end

// Routes du Backend
const authRoutes = require('./routes/auth.routes');
const teacherRoutes = require('./routes/teacher.routes');
const contractRoutes = require('./routes/contract.routes');

app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/contracts', contractRoutes);

// Route par défaut (Test)
app.get('/', (req, res) => {
    res.send('API EduCoursCI en ligne !');
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
