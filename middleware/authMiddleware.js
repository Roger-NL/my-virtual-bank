const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;  // Anexa o usuário à requisição
    next();  // Passa para o próximo middleware ou rota
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ error: 'Erro na autenticação. Tente novamente mais tarde.' });
  }
};

module.exports = authMiddleware;
