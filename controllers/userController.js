// controllers/userController.js

const jwt = require('jsonwebtoken'); // Importa a biblioteca JWT
const bcrypt = require('bcrypt');
const { User, Transaction } = require('../models');

// Função para gerar um IBAN fictício para fins de demonstração
const generateIBAN = () => {
  const countryCode = "BR"; // Código do país, por exemplo, "BR" para Brasil
  const bankCode = "1234"; // Código do banco
  const branchCode = "5678"; // Código da agência
  const accountNumber = Math.floor(10000000 + Math.random() * 90000000); // Número da conta aleatório
  const checkDigits = "00"; // Dígitos de verificação (exemplo)

  return `${countryCode}${checkDigits}${bankCode}${branchCode}${accountNumber}`;
};

// Função para registrar um novo usuário
const register = async (req, res) => {
  const { nome, usuario, senha, cpf, bi, dataNascimento, saldo = 0 } = req.body;

  try {
    const userExists = await User.findOne({ where: { usuario } });
    if (userExists) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const iban = generateIBAN(); // Gera o IBAN automaticamente

    const newUser = await User.create({
      nome,
      usuario,
      senha: hashedPassword,
      cpf,
      bi,
      dataNascimento,
      saldo,
      iban, // Armazena o IBAN gerado
    });

    res.status(201).json({
      id: newUser.id,
      nome: newUser.nome,
      usuario: newUser.usuario,
      cpf: newUser.cpf,
      bi: newUser.bi,
      dataNascimento: newUser.dataNascimento,
      saldo: newUser.saldo,
      iban: newUser.iban, // Retorna o IBAN gerado
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: 'Erro ao registrar usuário. Tente novamente mais tarde.' });
  }
};

// Função para fazer login
const login = async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    const user = await User.findOne({ where: { usuario } });
    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const passwordMatch = await bcrypt.compare(senha, user.senha);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    // Gera um token JWT com as informações do usuário
    const token = jwt.sign(
      { id: user.id, usuario: user.usuario, admin: user.admin },
      process.env.JWT_SECRET, // A chave secreta usada para assinar o token (definida no .env)
      { expiresIn: '2h' } // O token expira em 2 hora
    );

    // Retorna o token junto com a mensagem de sucesso e o usuário logado
    res.status(200).json({ message: 'Login bem-sucedido', token });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login. Tente novamente mais tarde.' });
  }
};

// Função para realizar um depósito
const deposit = async (req, res) => {
  const { userId, valor } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualiza o saldo do usuário
    user.saldo += parseFloat(valor);
    await user.save();

    // Cria uma nova transação de depósito
    await Transaction.create({
      tipo: 'depósito',
      valor,
      userId: user.id,
    });

    res.status(200).json({ message: 'Depósito realizado com sucesso', saldo: user.saldo });
  } catch (error) {
    console.error('Erro ao realizar depósito:', error);
    res.status(500).json({ error: 'Erro ao realizar depósito. Tente novamente mais tarde.' });
  }
};

// Função para realizar um saque
const withdraw = async (req, res) => {
  const { userId, valor } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verifica se o usuário tem saldo suficiente
    if (user.saldo < parseFloat(valor)) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    // Atualiza o saldo do usuário
    user.saldo -= parseFloat(valor);
    await user.save();

    // Cria uma nova transação de saque
    await Transaction.create({
      tipo: 'saque',
      valor,
      userId: user.id,
    });

    res.status(200).json({ message: 'Saque realizado com sucesso', saldo: user.saldo });
  } catch (error) {
    console.error('Erro ao realizar saque:', error);
    res.status(500).json({ error: 'Erro ao realizar saque. Tente novamente mais tarde.' });
  }
};

// Função para realizar uma transferência
const transfer = async (req, res) => {
  const { userId, valor, destinoIban } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Verifica se o usuário tem saldo suficiente
    if (user.saldo < parseFloat(valor)) {
      return res.status(400).json({ error: 'Saldo insuficiente' });
    }

    const destinatario = await User.findOne({ where: { iban: destinoIban } });
    if (!destinatario) {
      return res.status(404).json({ error: 'Destinatário não encontrado' });
    }

    // Atualiza o saldo do usuário remetente
    user.saldo -= parseFloat(valor);
    await user.save();

    // Atualiza o saldo do destinatário
    destinatario.saldo += parseFloat(valor);
    await destinatario.save();

    // Cria uma nova transação de transferência
    await Transaction.create({
      tipo: 'transferência',
      valor,
      userId: user.id,
      destinoIban: destinatario.iban,
    });

    res.status(200).json({ message: 'Transferência realizada com sucesso', saldo: user.saldo });
  } catch (error) {
    console.error('Erro ao realizar transferência:', error);
    res.status(500).json({ error: 'Erro ao realizar transferência. Tente novamente mais tarde.' });
  }
};

// Função para obter o extrato bancário do usuário
const getStatements = async (req, res) => {
  try {
    const requestingUser = req.user;  // Usuário que está fazendo a requisição
    const userId = req.query.userId || requestingUser.id;  // ID do usuário cujo extrato será visualizado

    // Verifica se o usuário tentando acessar um extrato não é administrador e está tentando acessar o extrato de outro usuário
    if (requestingUser.id !== parseInt(userId) && !requestingUser.admin) {
      return res.status(403).json({ error: 'Acesso negado. Você não tem permissão para visualizar o extrato deste usuário.' });
    }

    // Verifica se o usuário existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Buscar todas as transações do usuário
    const transactions = await Transaction.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],  // Ordenar pela data da transação, da mais recente para a mais antiga
    });

    res.status(200).json(transactions);
  } catch (error) {
    console.error('Erro ao obter extrato bancário:', error);
    res.status(500).json({ error: 'Erro ao obter extrato bancário. Tente novamente mais tarde.' });
  }
};

module.exports = { register, login, deposit, withdraw, transfer, getStatements };
