const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacher.controller');

// Route : GET /api/teachers
router.get('/', teacherController.getAllTeachers);

module.exports = router;
