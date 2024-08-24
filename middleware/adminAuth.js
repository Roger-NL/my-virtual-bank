const jwt = require('jsonwebtoken');
const { User } = require('../models');

const adminAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Verifica se o cabeçalho de autorização está presente
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  // Extrai o token do cabeçalho
  const token = authHeader.split(' ')[1];

  try {
    // Verifica e decodifica o token JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decodificado:", decoded);  // Log para verificar o conteúdo do token

    // Busca o usuário no banco de dados usando o ID decodificado
    const user = await User.findByPk(decoded.id);
    console.log("Usuário encontrado:", user);  // Log para verificar o usuário encontrado

    // Verifica se o usuário existe e se é administrador
    if (!user || !user.admin) {
      return res.status(403).json({ error: 'Acesso negado. Apenas administradores podem realizar esta ação.' });
    }

    // Anexa o usuário à requisição para que possa ser usado nas próximas funções
    req.user = user;

    // Se for administrador, permite que a requisição continue
    next();
  } catch (error) {
    console.error('Erro na autenticação de administrador:', error);  // Log do erro completo
    res.status(500).json({ error: 'Erro na autenticação. Tente novamente mais tarde.' });
  }
};

module.exports = adminAuth;
