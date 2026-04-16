const pool = require('../config/db');

exports.getAllTeachers = async (req, res) => {
    try {
        const [teachers] = await pool.query(`
            SELECT u.id, u.name as firstName, u.phone, u.city, 
                   tp.diploma_level as diplomaId, tp.hourly_rate as hourlyRate, 
                   tp.subjects, tp.description, tp.rating, tp.reviews_count as reviewsCount
            FROM users u
            JOIN teachers_profile tp ON u.id = tp.user_id
            WHERE u.role = 'teacher'
        `);
        
        // Formatter subjects s'il existe et découper le nom
        const formattedTeachers = teachers.map(t => ({
            ...t,
            subjects: t.subjects ? t.subjects.split(',').map(s => s.trim()) : [],
            firstName: t.firstName.split(' ')[0] || '',
            lastName: t.firstName.split(' ').slice(1).join(' ') || ''
        }));
        
        res.json(formattedTeachers);
    } catch (error) {
        console.error("Erreur récupération enseignants:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
