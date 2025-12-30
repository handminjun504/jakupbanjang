const { Sequelize } = require('sequelize');

// Supabase PostgreSQL 설정
// Note: dotenv is already loaded in index.js
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  console.error('Please set DATABASE_URL in your .env file');
  process.exit(1);
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

// 데이터베이스 연결 테스트
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection has been established successfully.');
    console.log('📦 Using Supabase PostgreSQL');
  })
  .catch(err => {
    console.error('❌ Unable to connect to the database:', err);
    process.exit(1);
  });

module.exports = sequelize;

