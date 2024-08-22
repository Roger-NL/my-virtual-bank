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

module.exports = router;
