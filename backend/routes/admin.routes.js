const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireAdmin } = require('../middlewares/roleMiddleware');

router.use(authMiddleware, requireAdmin);

router.get('/users', adminController.getAllUsers);
router.delete('/users/:id', adminController.deleteUser);
router.get('/contracts', adminController.getAllContracts);
// DELETE /api/admin/contracts/:id - Supprimer un contrat
router.delete('/contracts/:id', adminController.deleteContract);
router.delete('/platform-reviews/:id', adminController.deletePlatformReview);
router.post('/global-message', adminController.sendGlobalMessage);

module.exports = router;
