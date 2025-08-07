const { sequelize } = require('./models/db');

console.log('Testing sequelize import...');
console.log('sequelize type:', typeof sequelize);
console.log('sequelize.define type:', typeof sequelize.define);

if (sequelize && typeof sequelize.define === 'function') {
    console.log('✅ Sequelize instance is working correctly');
} else {
    console.log('❌ Sequelize instance is not working');
    console.log('sequelize object:', sequelize);
}
