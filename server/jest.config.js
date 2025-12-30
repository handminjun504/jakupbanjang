/**
 * Jest 설정 파일 (Backend 테스트)
 */

module.exports = {
  // 테스트 환경
  testEnvironment: 'node',

  // 테스트 파일 위치
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ],

  // 커버리지 수집 대상
  collectCoverageFrom: [
    'controllers/**/*.js',
    'models/**/*.js',
    'middlewares/**/*.js',
    'utils/**/*.js',
    '!**/__tests__/**',
    '!**/node_modules/**'
  ],

  // 커버리지 리포트 형식
  coverageReporters: ['text', 'lcov', 'html'],

  // 커버리지 디렉토리
  coverageDirectory: 'coverage',

  // 테스트 타임아웃 (밀리초)
  testTimeout: 10000,

  // 전역 설정
  verbose: true,

  // 테스트 환경 변수
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],

  // 모듈 경로 매핑
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1'
  }
};

