const { Sequelize } = require('sequelize');

// Supabase PostgreSQL 설정
// Note: dotenv is already loaded in index.js
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  // 테스트 환경에서는 기본 테스트 DB URL 사용
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
    // 테스트 환경에서는 exit하지 않음
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
  });

module.exports = sequelize;

