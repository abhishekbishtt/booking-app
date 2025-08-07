const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const requiredEnvVars = ['DB_NAME', 'DB_USER', 'DB_PASSWORD', 'DB_HOST'];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env variables: ${key}`);
  }
});




const getPoolConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const poolConfigs = {
    development: {
      max: 5,
      min: 1,
      acquire: 30000,
      idle: 10000
    },
    production: {
      max: 25,
      min: 5,
      acquire: 60000,
      idle: 10000
    },
    test: {
      max: 2,
      min: 0,
      acquire: 10000,
      idle: 5000
    }
  };

  return poolConfigs[env] || poolConfigs.development;
};

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    pool: getPoolConfig(), 
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
      keepAlive: true,
      connectionTimeout: 60000,
    },
    query: {
      timeout: 30000,
    }
  }
);

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    console.log('📊 Pool config:', sequelize.options.pool);
    return true;
  } catch (err) {
    console.error(`❌ Cannot connect to database:`, err.message);
    return false;
  }
};

const getPoolStatus = () => {
  try {
    const pool = sequelize?.connectionManager?.pool;
    return {
      size: pool?.size || 0,
      available: pool?.available || 0,
      using: pool?.using || 0,
      waiting: pool?.waiting || 0
    };
  } catch (err) {
    return { error: 'Failed to fetch pool status', details: err.message };
  }
};

const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('🔒 Database connection closed');
  } catch (err) {
    console.error('❌ Error closing database connection:', err);
  }
};

module.exports = {
  sequelize,
  testConnection,
  getPoolConfig,
  getPoolStatus,
  closeConnection
};


testConnection();
