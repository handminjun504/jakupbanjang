const { Sequelize } = require('sequelize');

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  if (process.env.NODE_ENV === 'test') {
    console.warn('⚠️  DATABASE_URL not set, using test database');
    process.env.DATABASE_URL = 'postgresql://postgres.diqflvxzsjvndlbwzldi:9hDhHMfxFe2Z8rFH@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require';
  } else {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.error('Please set DATABASE_URL in your .env file');
    process.exit(1);
  }
}

const finalDatabaseUrl = process.env.DATABASE_URL || databaseUrl;

const sequelize = new Sequelize(finalDatabaseUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 60000,
    statement_timeout: 30000,
    idle_in_transaction_session_timeout: 30000,
  },
  logging: false,
  pool: {
    max: 3,
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 1000,
  },
  retry: {
    max: 3,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /SequelizeConnectionAcquireTimeoutError/,
      /Operation timeout/,
      /ETIMEDOUT/,
      /ECONNRESET/,
      /ECONNREFUSED/,
    ],
  },
});

const connectWithRetry = async (retries = 5, delay = 3000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
      console.log('📦 Using Supabase PostgreSQL');
      return;
    } catch (err) {
      console.error(`❌ DB connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
        delay *= 1.5;
      }
    }
  }
  console.error('❌ All DB connection attempts failed. Server will start but DB may be unavailable.');
};

if (process.env.NODE_ENV !== 'test') {
  connectWithRetry();
}

module.exports = sequelize;

