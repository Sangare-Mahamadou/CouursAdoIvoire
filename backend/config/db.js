const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test de connexion
pool.connect()
    .then((client) => {
        console.log('✅ Connecté avec succès à Vercel Postgres.');
        client.release();
    })
    .catch((err) => {
        console.error('❌ Erreur de connexion Postgres :', err.message);
    });

module.exports = pool;
