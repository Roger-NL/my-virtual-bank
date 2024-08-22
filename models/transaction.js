// models/transaction.js

module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
      tipo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      valor: {
        type: DataTypes.DECIMAL,
        allowNull: false,
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
    });
  
    Transaction.associate = (models) => {
      Transaction.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user',
      });
    };
  
    return Transaction;
  };
  