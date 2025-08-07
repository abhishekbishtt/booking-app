const {DataTypes} = require('sequelize');
const {sequelize} = require('./db');
const User = require('./user.model');

const BlackListedToken = sequelize.define('BlacklistedToken', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    autoIncrement: true
},
token:{
    type: DataTypes.STRING,
    allowNull: false,
    unique: true

},
user_id:{
    type: DataTypes.STRING,
    allowNull: false,
    references:{
        model: User,
        key: 'id'

    }
},
expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
},}, {
  timestamps: true,
  tableName: 'blacklisted_tokens',


});
module.exports = BlackListedToken;