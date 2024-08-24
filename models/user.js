// models/user.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    nome: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    usuario: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    cpf: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    bi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    dataNascimento: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    saldo: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0.0,
    },
    iban: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false, // Por padrão, os usuários não são administradores
    },
  });

  return User;
};
