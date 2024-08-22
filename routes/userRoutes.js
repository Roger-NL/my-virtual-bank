// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rota para registrar um novo usuário
router.post('/register', userController.register);

// Rota para fazer login
router.post('/login', userController.login);

// Rota para realizar um depósito
router.post('/deposit', userController.deposit);

// Rota para realizar um saque
router.post('/withdraw', userController.withdraw);

// Rota para realizar uma transferência
router.post('/transfer', userController.transfer);

module.exports = router;
