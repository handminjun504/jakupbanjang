const { Sequelize } = require('sequelize');

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  if (process.env.NODE_ENV === 'test') {
    console.warn('⚠️  DATABASE_URL not set, using test database');
    databaseUrl = 'postgresql://postgres.diqflvxzsjvndlbwzldi:9hDhHMfxFe2Z8rFH@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require';
  } else {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.error('Please set DATABASE_URL in your .env file');
    process.exit(1);
  }
}

// Supabase 직접 연결(5432) → pooler(6543) 자동 변환
// 클라우드 환경에서 직접 연결은 ETIMEDOUT 발생 가능
if (databaseUrl.includes('supabase.com') || databaseUrl.includes('supabase.co')) {
  const original = databaseUrl;

  // 포트 5432를 6543(pooler)으로 변환
  databaseUrl = databaseUrl.replace(/:5432\//, ':6543/');

  // 직접 연결 호스트를 pooler 호스트로 변환
  // db.xxx.supabase.co → aws-0-ap-northeast-2.pooler.supabase.com
  databaseUrl = databaseUrl.replace(
    /db\.([a-z0-9]+)\.supabase\.co/,
    'aws-0-ap-northeast-2.pooler.supabase.com'
  );

  if (original !== databaseUrl) {
    console.log('🔄 DATABASE_URL auto-converted to use Supabase pooler (port 6543)');
  }
}

console.log('🔗 DB host:', databaseUrl.replace(/\/\/[^@]+@/, '//***@'));

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 15000,
    statement_timeout: 30000,
    idle_in_transaction_session_timeout: 30000,
  },
  logging: false,
  pool: {
    max: 3,
    min: 0,
    acquire: 30000,
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

const connectWithRetry = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection established successfully.');
      return;
    } catch (err) {
      console.error(`❌ DB connection attempt ${i + 1}/${retries} failed:`, err.message);
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
      }
    }
  }
  console.error('❌ All DB connection attempts failed. DB may be unavailable.');
};

if (process.env.NODE_ENV !== 'test') {
  connectWithRetry().catch(() => {});
}

module.exports = sequelize;

