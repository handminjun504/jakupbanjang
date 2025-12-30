/**
 * 표준 API 응답 포맷터
 * 모든 API 응답을 일관된 형식으로 변환
 */

/**
 * 성공 응답
 * @param {Object} res - Express response 객체
 * @param {*} data - 응답 데이터
 * @param {string} message - 성공 메시지
 * @param {number} statusCode - HTTP 상태 코드 (기본값: 200)
 */
const successResponse = (res, data = null, message = '성공', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

/**
 * 생성 성공 응답
 * @param {Object} res - Express response 객체
 * @param {*} data - 생성된 데이터
 * @param {string} message - 성공 메시지
 */
const createdResponse = (res, data, message = '생성되었습니다') => {
  return successResponse(res, data, message, 201);
};

/**
 * 에러 응답
 * @param {Object} res - Express response 객체
 * @param {string} message - 에러 메시지
 * @param {number} statusCode - HTTP 상태 코드 (기본값: 500)
 * @param {*} errors - 상세 에러 정보 (선택)
 */
const errorResponse = (res, message = '오류가 발생했습니다', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  // 개발 환경에서만 상세 에러 정보 포함
  if (errors && process.env.NODE_ENV === 'development') {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * 유효성 검증 에러 응답
 * @param {Object} res - Express response 객체
 * @param {*} errors - 유효성 검증 에러 배열
 */
const validationErrorResponse = (res, errors) => {
  return res.status(400).json({
    success: false,
    message: '유효성 검증에 실패했습니다',
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * 권한 없음 응답
 * @param {Object} res - Express response 객체
 * @param {string} message - 에러 메시지
 */
const unauthorizedResponse = (res, message = '인증이 필요합니다') => {
  return errorResponse(res, message, 401);
};

/**
 * 접근 금지 응답
 * @param {Object} res - Express response 객체
 * @param {string} message - 에러 메시지
 */
const forbiddenResponse = (res, message = '접근 권한이 없습니다') => {
  return errorResponse(res, message, 403);
};

/**
 * 찾을 수 없음 응답
 * @param {Object} res - Express response 객체
 * @param {string} message - 에러 메시지
 */
const notFoundResponse = (res, message = '리소스를 찾을 수 없습니다') => {
  return errorResponse(res, message, 404);
};

module.exports = {
  successResponse,
  createdResponse,
  errorResponse,
  validationErrorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse
};

