// models/transaction.js

module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    tipo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    valor: {
      type: DataTypes.DECIMAL,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true, 
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    destinoIban: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
  };

  return Transaction;
};
