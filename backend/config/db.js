const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test de connexion
pool.getConnection()
    .then((connection) => {
        console.log('✅ Connecté avec succès à la base de données MySQL "educours_ci".');
        connection.release();
    })
    .catch((err) => {
        console.error('❌ Erreur de connexion MySQL :', err.message);
        console.error('⚠️ Avez-vous bien allumé WAMP, et importé le fichier database.sql dans phpMyAdmin ?');
    });

module.exports = pool;
