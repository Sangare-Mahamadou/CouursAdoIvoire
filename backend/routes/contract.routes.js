const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const contractController = require('../controllers/contract.controller');

// GET /api/contracts - Afficher le dashboard
router.get('/', authMiddleware, contractController.getMyContracts);

// POST /api/contracts - Parent réserve un professeur
router.post('/', authMiddleware, contractController.createContract);

// PATCH /api/contracts/:id - Professeur modifie le statut (accepter/refuser)
router.patch('/:id', authMiddleware, contractController.updateContractStatus);

// POST /api/contracts/:id/rate - Parent note l'enseignant
router.post('/:id/rate', authMiddleware, contractController.rateTeacher);

module.exports = router;
