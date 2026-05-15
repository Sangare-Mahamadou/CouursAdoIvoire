const pool = require('../config/db');

exports.getAllTeachers = async (req, res) => {
    try {
        const { rows: teachers } = await pool.query(`
            SELECT u.id, u.name, u.phone, u.city,
                   tp.diploma_level,
                   tp.subjects, tp.description, tp.rating, tp.reviews_count as "reviewsCount",
                   tp.availability_days, tp.profile_picture_url
            FROM users u
            LEFT JOIN teachers_profile tp ON u.id = tp.user_id
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
                   tp.availability_days, tp.profile_picture_url
            FROM users u
            LEFT JOIN teachers_profile tp ON u.id = tp.user_id
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

exports.updateProfile = async (req, res) => {
    const userId = req.user.id;
    const { name, email, phone, city, diploma_level, subjects, description, availability_days } = req.body;

    try {
        // Mettre à jour la table users
        await pool.query(
            'UPDATE users SET name = $1, email = $2, phone = $3, city = $4 WHERE id = $5',
            [name, email, phone, city, userId]
        );

        // Si c'est un enseignant, mettre à jour la table teachers_profile
        if (req.user.role === 'teacher') {
            let profilePictureUrl;
            if (req.file) {
                const blob = await put(`teachers/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
                    access: 'public',
                    token: process.env.BLOB_READ_WRITE_TOKEN
                });
                profilePictureUrl = blob.url;
            }

            const { rows } = await pool.query('SELECT user_id FROM teachers_profile WHERE user_id = $1', [userId]);

            if (rows.length > 0) {
                // Le profil existe, on le met à jour
                let updateQuery = 'UPDATE teachers_profile SET diploma_level = $1, subjects = $2, description = $3, availability_days = $4';
                const queryParams = [diploma_level, subjects, description, availability_days, userId];
                
                if (profilePictureUrl) {
                    updateQuery += ', profile_picture_url = $6';
                    queryParams.splice(5, 0, profilePictureUrl);
                }
                
                updateQuery += ' WHERE user_id = $' + (queryParams.length);

                await pool.query(updateQuery, queryParams);

            } else {
                // Le profil n'existe pas, on le crée
                await pool.query(
                    'INSERT INTO teachers_profile (user_id, diploma_level, subjects, description, availability_days, profile_picture_url) VALUES ($1, $2, $3, $4, $5, $6)',
                    [userId, diploma_level, subjects, description, availability_days, profilePictureUrl || '']
                );
            }
        }

        res.json({ message: "Profil mis à jour avec succès." });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du profil:", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};
