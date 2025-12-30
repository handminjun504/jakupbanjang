const logger = require('../config/logger');

/**
 * 전역 에러 핸들러 미들웨어
 * 모든 에러를 잡아서 일관된 형식으로 응답
 */
const errorHandler = (err, req, res, next) => {
  // 에러 로깅
  logger.error(`${err.name}: ${err.message}`);
  logger.error(`Stack: ${err.stack}`);
  logger.error(`Path: ${req.method} ${req.path}`);
  logger.error(`Body: ${JSON.stringify(req.body)}`);

  // 기본 에러 정보
  const statusCode = err.statusCode || 500;
  const message = err.message || '서버 내부 오류가 발생했습니다';

  // 에러 응답
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  // 개발 환경에서만 스택 트레이스 포함
  if (process.env.NODE_ENV === 'development') {
    response.error = {
      name: err.name,
      stack: err.stack,
      details: err.details || null
    };
  }

  res.status(statusCode).json(response);
};

/**
 * 404 Not Found 핸들러
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`경로를 찾을 수 없습니다 - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * 비동기 함수 에러 래퍼
 * async/await 함수의 에러를 자동으로 catch
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};

