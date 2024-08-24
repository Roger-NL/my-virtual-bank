const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const userRoutes = require('./routes/userRoutes'); // Importa as rotas de usuário
const adminRoutes = require('./routes/adminRoutes'); // Importa as rotas administrativas

dotenv.config(); // Carrega as variáveis de ambiente a partir do arquivo .env

const app = express(); // Cria uma instância do Express
app.use(bodyParser.json()); // Configura o middleware para parsear JSON nas requisições

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('Bem-vindo ao New Bank!');
});

// Usa as rotas de usuário para qualquer requisição que comece com /api/users
app.use('/api/users', userRoutes);

// Usa as rotas administrativas para qualquer requisição que comece com /api/admin
app.use('/api/admin', adminRoutes); // As rotas administrativas devem ser configuradas aqui

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
