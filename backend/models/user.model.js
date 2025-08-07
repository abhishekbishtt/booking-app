
const {DataTypes}= require('sequelize');
const { sequelize } = require('./db');

//sequellize.define  has a pluralization property.. 
// it means lets say we enterned model name 'User" so it will automatically write a query where it will look up for Users table in databas
// in case we need to prevent it we need to define table name inside sequalize.define()

console.log('🔍 Imported sequelize:', typeof sequelize);
console.log('🔍 sequelize.define:',typeof sequelize.define);




if(!sequelize ||typeof sequelize.define !=='function'){
    console.error('❌sequelize is not a proper Sequelize instance');
    console.error('sequelize value:', sequelize);
    process.exit(1);
}



console.log('🔍 About to define User model...');

const User = sequelize.define('User', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'customer'),
      allowNull: false,
      defaultValue: 'customer'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    reset_token:{
      type: DataTypes.STRING,
      allowNull: true
    },
    reset_token_expiry:{
      type:DataTypes.DATE,
      allowNull:true,

    },
  }, {
    tableName: 'users',
    timestamps: true
  });
  
  module.exports = User;