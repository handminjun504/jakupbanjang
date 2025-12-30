const logger = require('../config/logger');

/**
 * HTTP 요청 로깅 미들웨어
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // 응답이 완료되면 로그 기록
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms - ${req.ip}`;

    if (res.statusCode >= 500) {
      logger.error(logMessage);
    } else if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.http(logMessage);
    }
  });

  next();
};

module.exports = requestLogger;

