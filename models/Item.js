const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./User');

const Item = sequelize.define('Item', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true },
  sold: { type: DataTypes.BOOLEAN, defaultValue: false }
});

Item.belongsTo(User, { as: 'seller', foreignKey: 'sellerId' });
User.hasMany(Item, { foreignKey: 'sellerId' });

module.exports = Item;
