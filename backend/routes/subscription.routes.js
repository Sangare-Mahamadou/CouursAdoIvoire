const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const authMiddleware = require('../middlewares/authMiddleware');

// Souscrire à un abonnement premium
router.post('/subscribe', authMiddleware, subscriptionController.subscribe);

module.exports = router;
