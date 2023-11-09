const {DataTypes} = require('sequelize');
const sequelize = require('../utils/sequelize');

const User = sequelize.define('User', {
    email: {
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING,
    },
    display_name: {
        type: DataTypes.STRING,
    },
}, {
    indexes: [
        {unique: true, fields: ['email']},
    ]
});

// User.sync({alter: true});

module.exports = User;