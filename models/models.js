const sequelize = require('../utils/sequelize');
const User = require('./user');
const Task = require('./task');

User.hasMany(Task);
Task.belongsTo(User);

sequelize.sync({alter: true});

module.exports = {
    User,
    Task,
};