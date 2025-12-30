/**
 * Jest 테스트 환경 설정
 */

// 테스트 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only';
process.env.DATABASE_URL = ':memory:'; // SQLite 인메모리 DB
process.env.ENCRYPTION_KEY = Buffer.from('test-encryption-key-32-bytes!!').toString('base64');

// 전역 타임아웃 설정
jest.setTimeout(10000);

// 콘솔 경고 무시 (테스트 로그 깔끔하게)
global.console = {
  ...console,
  error: jest.fn(), // 에러는 무시
  warn: jest.fn(),  // 경고는 무시
  log: console.log, // 일반 로그는 유지
};

// 테스트 후 정리
afterAll(async () => {
  // DB 연결 종료 등
  await new Promise(resolve => setTimeout(resolve, 500));
});

