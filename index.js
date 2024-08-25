const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { sequelize, User, Transaction } = require('./models'); // Importa os modelos
const userRoutes = require('./routes/userRoutes'); // Rotas de usuários
const adminRoutes = require('./routes/adminRoutes'); // Rotas administrativas
const adminAuth = require('./middleware/adminAuth'); // Middleware de autenticação para admins
const authMiddleware = require('./middleware/authMiddleware'); // Middleware de autenticação

dotenv.config(); // Carrega as variáveis de ambiente a partir do arquivo .env

const app = express(); // Cria uma instância do Express
app.use(bodyParser.json()); // Configura o middleware para parsear JSON nas requisições

// Servir arquivos estáticos da pasta "public"
app.use(express.static('public'));

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('Bem-vindo ao New Bank!');
});

// Usando as rotas de usuários
app.use('/api/users', userRoutes);

// Usando as rotas administrativas
app.use('/api/admin', adminRoutes);

// Rota para obter o extrato bancário do usuário
app.get('/api/users/statements', authMiddleware, async (req, res) => {
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
});

// Inicia o servidor na porta definida no arquivo .env ou na porta 3000 como padrão
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  // Verifica a conexão com o banco de dados
  try {
    await sequelize.sync({ force: false }); // Sincroniza o modelo com o banco de dados sem sobrescrever
    console.log('Conexão com o banco de dados SQLite estabelecida com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
  }
});
