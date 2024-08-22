const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const { sequelize } = require('./models');
const userRoutes = require('./routes/userRoutes'); // Importa as rotas de usuário

dotenv.config(); // Carrega as variáveis de ambiente a partir do arquivo .env

const app = express(); // Cria uma instância do Express
app.use(bodyParser.json()); // Configura o middleware para parsear JSON nas requisições

// Rota de teste para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('Bem-vindo ao New Bank!');
});

// Usa as rotas de usuário para qualquer requisição que comece com /api/users
app.use('/api/users', userRoutes);

// Inicia o servidor na porta definida no arquivo .env ou na porta 3000 como padrão
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Servidor rodando na porta ${PORT}`);

  // Verifica a conexão com o banco de dados
  try {
    await sequelize.sync({ force: false });
    console.log('Conexão com o banco de dados SQLite estabelecida com sucesso.');
  } catch (error) {
    console.error('Erro ao conectar com o banco de dados:', error);
  }
});
