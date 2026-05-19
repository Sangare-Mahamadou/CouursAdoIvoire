const pool = require('../config/db');

const requiredVars = ['ADMIN_NAME', 'ADMIN_EMAIL', 'ADMIN_PHONE', 'ADMIN_PASSWORD_HASH'];
const missingVars = requiredVars.filter((name) => !process.env[name]);

if (missingVars.length > 0) {
    console.error(`Variables manquantes: ${missingVars.join(', ')}`);
    process.exit(1);
}

const seedAdmin = async () => {
    try {
        await pool.query(`
            INSERT INTO users (name, email, phone, city, password_hash, role)
            VALUES ($1, $2, $3, $4, $5, 'admin')
            ON CONFLICT (phone) DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                city = EXCLUDED.city,
                password_hash = EXCLUDED.password_hash,
                role = 'admin'
        `, [
            process.env.ADMIN_NAME,
            process.env.ADMIN_EMAIL,
            process.env.ADMIN_PHONE,
            process.env.ADMIN_CITY || 'Admin',
            process.env.ADMIN_PASSWORD_HASH
        ]);

        console.log('Compte administrateur cree ou mis a jour.');
    } catch (error) {
        console.error('Erreur creation admin:', error.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
};

seedAdmin();
