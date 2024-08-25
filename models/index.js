const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];

const db = {};

// Configura a conexão com o banco de dados usando as configurações definidas em config.json
const sequelize = new Sequelize(config);

// Leitura de todos os arquivos de modelo na pasta atual
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&  // Exclui arquivos ocultos
      file !== basename &&        // Exclui este arquivo
      file.slice(-3) === '.js'    // Inclui apenas arquivos JavaScript
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;  // Armazena os modelos em db
  });

// Estabelece as associações entre modelos, se existirem
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Adiciona a instância do Sequelize e a classe Sequelize ao objeto db para exportação
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
