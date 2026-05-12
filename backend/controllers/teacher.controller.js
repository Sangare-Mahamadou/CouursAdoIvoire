const pool = require('../config/db');

exports.getAllTeachers = async (req, res) => {
    try {
        const { rows: teachers } = await pool.query(`
            SELECT u.id, u.name, u.phone, u.city,
                   tp.diploma_level as "diploma",
                   tp.subjects, tp.description, tp.rating, tp.reviews_count as "reviewsCount",
                   tp.profile_picture_url
            FROM users u
            JOIN teachers_profile tp ON u.id = tp.user_id
            WHERE u.role = 'teacher'
        `);
        
        // Formatter subjects s'il existe et découper le nom
        const formattedTeachers = teachers.map(t => {
            let parsedSubjects = [];
            try {
                parsedSubjects = t.subjects ? JSON.parse(t.subjects) : [];
                // Au cas où c'est un vieil array de strings
                if (parsedSubjects.length > 0 && typeof parsedSubjects[0] === 'string') {
                    parsedSubjects = parsedSubjects.map(s => ({ name: s, price: 5000 }));
                }
            } catch {
                parsedSubjects = [];
            }
            return {
                ...t,
                subjects: parsedSubjects,
                firstName: t.name ? t.name.split(' ')[0] : '',
                lastName: t.name ? t.name.split(' ').slice(1).join(' ') : ''
            };
        });
        
        res.json(formattedTeachers);
    } catch (error) {
        console.error("Erreur récupération enseignants:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.getTeacherReviews = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const { rows: reviews } = await pool.query(`
            SELECT r.id, r.rating, r.comment, r.created_at, u.name as author_name
            FROM reviews r
            JOIN users u ON r.author_id = u.id
            WHERE r.teacher_id = $1
            ORDER BY r.created_at DESC
        `, [teacherId]);
        res.json(reviews);
    } catch (error) {
        console.error("Erreur récupération des avis:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};

exports.getTeacherById = async (req, res) => {
    try {
        const teacherId = req.params.id;
        const { rows } = await pool.query(`
            SELECT u.id, u.name, u.phone, u.city,
                   tp.diploma_level,
                   tp.subjects, tp.description, tp.rating, tp.reviews_count as "reviewsCount",
                   tp.profile_picture_url
            FROM users u
            JOIN teachers_profile tp ON u.id = tp.user_id
            WHERE u.id = $1 AND u.role = 'teacher'
        `, [teacherId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Enseignant non trouvé." });
        }

        const teacher = rows[0];
        let parsedSubjects = [];
        try {
            parsedSubjects = teacher.subjects ? JSON.parse(teacher.subjects) : [];
        } catch {
            parsedSubjects = [];
        }

        const formattedTeacher = {
            ...teacher,
            subjects: parsedSubjects,
            firstName: teacher.name ? teacher.name.split(' ')[0] : '',
            lastName: teacher.name ? teacher.name.split(' ').slice(1).join(' ') : ''
        };

        res.json(formattedTeacher);
    } catch (error) {
        console.error("Erreur récupération enseignant:", error);
        res.status(500).json({ message: "Erreur serveur" });
    }
};
