const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const multer = require('multer');

const upload = multer({ storage: multer.memoryStorage() });

// Route : POST /api/auth/register
router.post('/register', upload.single('profile_picture'), authController.register);

// Route : POST /api/auth/login
router.post('/login', authController.login);

module.exports = router;
