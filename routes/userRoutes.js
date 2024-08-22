const express = require('express');
const { register, login } = require('../controllers/userController');

const router = express.Router();

// Rota para registrar um novo usuário
router.post('/register', register);

// Rota para login de usuário
router.post('/login', login);

module.exports = router;
