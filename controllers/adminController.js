// controllers/adminController.js

const { User, Transaction } = require('../models');

// Função para listar todos os usuários
const listAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'nome', 'usuario', 'iban', 'saldo'] });
    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários. Tente novamente mais tarde.' });
  }
};

// Função para visualizar o histórico de transações de todos os usuários
const listAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.findAll({ order: [['data', 'DESC']] });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Erro ao listar transações:', error);
    res.status(500).json({ error: 'Erro ao listar transações. Tente novamente mais tarde.' });
  }
};

// Função para adicionar dinheiro a uma conta
const addMoneyToAccount = async (req, res) => {
  const { userId, valor } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    user.saldo += parseFloat(valor);
    await user.save();

    // Registrar a transação no histórico
    await Transaction.create({
      tipo: 'Depósito Administrativo',
      valor: valor,
      data: new Date(),
      userId: user.id,
      destinoIban: user.iban,
    });

    res.status(200).json({ message: 'Dinheiro adicionado com sucesso', saldoAtual: user.saldo });
  } catch (error) {
    console.error('Erro ao adicionar dinheiro à conta:', error);
    res.status(500).json({ error: 'Erro ao adicionar dinheiro. Tente novamente mais tarde.' });
  }
};

module.exports = { listAllUsers, listAllTransactions, addMoneyToAccount };
