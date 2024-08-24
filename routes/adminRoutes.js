const express = require('express');
const { listAllUsers, listAllTransactions, addMoneyToAccount } = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth'); // Importa o middleware de autenticação de administrador

const router = express.Router();

router.use(adminAuth); // Aplica o middleware a todas as rotas abaixo

// Rota para listar todos os usuários
router.get('/users', listAllUsers);

// Rota para listar todas as transações
router.get('/transactions', listAllTransactions);

// Rota para adicionar dinheiro a uma conta
router.post('/users/add-money', addMoneyToAccount);

module.exports = router;
