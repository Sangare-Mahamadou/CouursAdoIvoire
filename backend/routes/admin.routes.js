const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/users', authMiddleware, adminController.getAllUsers);
router.delete('/users/:id', authMiddleware, adminController.deleteUser);
router.get('/contracts', authMiddleware, adminController.getAllContracts);
// DELETE /api/admin/contracts/:id - Supprimer un contrat
router.delete('/contracts/:id', authMiddleware, adminController.deleteContract);

module.exports = router;
