const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const User = sequelize.define('users', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: true },
    country: { type: DataTypes.STRING, allowNull: true },
    subscription_Type: { type: DataTypes.STRING, allowNull: true },
    watch_time_hours: { type: DataTypes.INTEGER, allowNull: true },
    favorite_genre: { type: DataTypes.STRING, allowNull: true },
    last_login: { type: DataTypes.DATE, allowNull: true },
}, {
    timestamps: true
});

module.exports = User;