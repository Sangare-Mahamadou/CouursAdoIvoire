const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');

// Route : GET /api/teachers
router.get('/', teacherController.getAllTeachers);

// GET /api/teachers/:id - Récupérer un enseignant par ID
router.get('/:id', teacherController.getTeacherById);

// POST /api/teachers/:id/review - Parent ajoute un avis
router.post('/:id/review', authMiddleware, contractController.addReview);

module.exports = router;
