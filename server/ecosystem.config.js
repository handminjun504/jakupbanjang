/**
 * PM2 설정 파일
 * 
 * 사용법:
 * - 개발: pm2 start ecosystem.config.js --env development
 * - 프로덕션: pm2 start ecosystem.config.js --env production
 * - 모니터링: pm2 monit
 * - 로그: pm2 logs jakup-backend
 * - 재시작: pm2 restart jakup-backend
 * - 중지: pm2 stop jakup-backend
 * - 삭제: pm2 delete jakup-backend
 */

module.exports = {
  apps: [{
    name: 'jakup-backend',
    script: './index.js',
    
    // 인스턴스 수 (클러스터 모드)
    instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
    exec_mode: process.env.NODE_ENV === 'production' ? 'cluster' : 'fork',
    
    // 환경 변수
    env: {
      NODE_ENV: 'development',
      PORT: 3001
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    
    // 자동 재시작 설정
    watch: false, // 프로덕션에서는 watch 비활성화
    ignore_watch: ['node_modules', 'logs', 'uploads', 'coverage'],
    
    // 메모리 제한 (1GB 초과 시 재시작)
    max_memory_restart: '1G',
    
    // 로그 설정
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    
    // 크래시 시 자동 재시작
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    
    // 우아한 종료 (Graceful Shutdown)
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true,
    
    // 크론 재시작 (매일 새벽 4시)
    cron_restart: '0 4 * * *',
    
    // 헬스체크
    health_check: {
      url: 'http://localhost:3001/health',
      interval: 30000, // 30초마다
      timeout: 5000,
      success_threshold: 2,
      failure_threshold: 3
    }
  }]
};

