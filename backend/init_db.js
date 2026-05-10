const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

async function initDB() {
    try {
        console.log('Lecture du fichier SQL...');
        const sqlPath = path.join(__dirname, 'database_postgres.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Séparer les commandes par le point-virgule
        const commands = sql.split(';').filter(cmd => cmd.trim() !== '');

        console.log(`Exécution de ${commands.length} commandes SQL...`);
        
        for (const cmd of commands) {
            await pool.query(cmd);
        }
        
        console.log('✅ Base de données initialisée avec succès !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation :', error.message);
    } finally {
        await pool.end();
    }
}

initDB();
