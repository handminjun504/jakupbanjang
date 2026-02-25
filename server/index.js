const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const sequelize = require('./config/database');
const setupAssociations = require('./config/associations');
const logger = require('./config/logger');
const requestLogger = require('./middlewares/requestLogger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { ensureBucketExists, STORAGE_BUCKETS } = require('./config/supabase');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const foremanRoutes = require('./routes/foremanRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// 모델 관계 설정
setupAssociations();

// CORS 설정 - 보안 강화 (Vercel 배포 지원)
const allowedOrigins = [
  'http://localhost:3000',  // 로컬 개발
  'http://localhost:3001',  // 로컬 개발 (다른 포트)
  'https://jakupbanjang-fr.vercel.app',  // Vercel 프로덕션
];

// 프로덕션 환경이면 Vercel URL 추가
if (process.env.NODE_ENV === 'production' && process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    // origin이 undefined인 경우 (같은 도메인, Postman 등) 허용
    if (!origin) return callback(null, true);
    
    // Vercel preview 배포 지원 (vercel.app으로 끝나는 도메인 모두 허용)
    if (origin && origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // 쿠키 및 인증 정보 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// 미들웨어
app.use(requestLogger);  // HTTP 요청 로깅
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 서빙 (업로드된 파일 접근 가능하도록)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 라우터 등록
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api', commentRoutes);      // /api/tasks/:taskId/comments
app.use('/api', attachmentRoutes);   // /api/tasks/:taskId/attachments
app.use('/api/admin', adminRoutes);  // /api/admin/* (관리자 전용)
app.use('/api/foreman', foremanRoutes); // /api/foreman/* (작업반장 전용)

// 기본 라우트
app.get('/', (req, res) => {
  res.send('Server is running');
});

/**
 * 헬스체크 엔드포인트
 * Docker, PM2, 로드 밸런서 등에서 서버 상태 확인용
 */
app.head('/health', (req, res) => {
  res.status(200).end();
});

app.get('/health', async (req, res) => {
  const uptime = process.uptime();
  const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`;

  let dbStatus = 'unknown';
  try {
    await Promise.race([
      sequelize.authenticate(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('DB check timeout')), 5000))
    ]);
    dbStatus = 'connected';
  } catch (err) {
    dbStatus = 'disconnected';
    logger.warn('Health check DB probe failed:', err.message);
  }

  const memoryUsage = process.memoryUsage();
  const statusCode = dbStatus === 'connected' ? 200 : 503;

  res.status(statusCode).json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: uptimeFormatted,
    uptimeSeconds: Math.floor(uptime),
    environment: process.env.NODE_ENV || 'development',
    database: dbStatus,
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024),
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    },
  });
});

/**
 * 준비 상태 확인 엔드포인트 (Kubernetes Readiness Probe 등)
 */
app.get('/ready', (req, res) => {
  // 서버가 트래픽을 받을 준비가 되었는지 확인
  res.status(200).json({
    ready: true,
    timestamp: new Date().toISOString()
  });
});

// 404 에러 핸들러 (모든 라우트 아래에 위치)
app.use(notFoundHandler);

// 전역 에러 핸들러 (가장 마지막에 위치)
app.use(errorHandler);

// Supabase Storage 버킷 초기화
const initializeStorage = async () => {
  try {
    logger.info('🔧 Initializing Supabase Storage buckets...');
    await ensureBucketExists(STORAGE_BUCKETS.WORK_LOGS);
    await ensureBucketExists(STORAGE_BUCKETS.EXPENSES);
    await ensureBucketExists(STORAGE_BUCKETS.ATTACHMENTS);
    logger.info('✅ Storage buckets initialized');
  } catch (error) {
    logger.error('❌ Failed to initialize storage buckets:', error);
    // 버킷 생성 실패해도 서버는 계속 실행
  }
};

// 데이터베이스 동기화 및 서버 시작
// Supabase 사용 시: 테이블이 이미 생성되어 있으므로 sync 비활성화
// 마이그레이션으로 스키마 관리
const startServer = async () => {
  try {
    // Supabase에 이미 테이블이 있으므로 sync 건너뛰기
    logger.info('✅ Using existing database schema (Supabase)');
    
    // Storage 버킷 초기화
    await initializeStorage();
    
    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Database: Supabase PostgreSQL`);
      logger.info(`📁 Storage: Supabase Storage`);
      logger.info(`✨ Server is ready to accept requests!`);
    });
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

