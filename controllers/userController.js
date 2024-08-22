const bcrypt = require('bcrypt');
const { User } = require('../models');

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

    res.status(200).json({ message: 'Login bem-sucedido', usuario: user.usuario });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao fazer login. Tente novamente mais tarde.' });
  }
};

module.exports = { register, login };
