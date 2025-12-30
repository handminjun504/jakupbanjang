/**
 * 공통 헬퍼 함수 모음
 * DRY 원칙에 따라 중복 코드를 제거하고 재사용성을 높임
 */

const logger = require('../config/logger');

/**
 * 근무자 이름 표시 헬퍼 (퇴사자 여부 표시)
 * 
 * @param {Object} worker - 근무자 정보
 * @param {string} worker.name - 근무자 이름
 * @param {string} worker.status - 근무자 상태 ('active' | 'resigned')
 * @returns {string} 표시용 이름 (예: "홍길동" 또는 "홍길동 (퇴사)")
 */
const getWorkerDisplayName = (worker) => {
  if (!worker || !worker.name) {
    return '이름 없음';
  }
  
  return worker.status === 'resigned' 
    ? `${worker.name} (퇴사)` 
    : worker.name;
};

/**
 * 회사 ID 검증 헬퍼
 * 
 * @param {Object} entity - 검증할 엔티티
 * @param {number} requiredCompanyId - 요구되는 회사 ID
 * @returns {boolean} 회사 ID 일치 여부
 */
const validateCompanyId = (entity, requiredCompanyId) => {
  return entity && entity.companyId === requiredCompanyId;
};

/**
 * 권한 검증 헬퍼
 * 
 * @param {Object} entity - 검증할 엔티티
 * @param {number} userId - 현재 사용자 ID
 * @param {string} foreignKey - 외래 키 이름 (예: 'creatorId', 'foremanId')
 * @returns {boolean} 권한 여부
 */
const validateOwnership = (entity, userId, foreignKey = 'creatorId') => {
  return entity && entity[foreignKey] === userId;
};

/**
 * 날짜 포맷 헬퍼 (YYYY-MM-DD)
 * 
 * @param {Date|string} date - 날짜 객체 또는 문자열
 * @returns {string} YYYY-MM-DD 형식
 */
const formatDate = (date) => {
  if (!date) return null;
  
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toISOString().split('T')[0];
};

/**
 * 에러 로그 및 응답 헬퍼
 * 
 * @param {Object} res - Express response 객체
 * @param {Error} error - 에러 객체
 * @param {string} context - 에러 컨텍스트 (어떤 작업 중 발생했는지)
 * @param {number} statusCode - HTTP 상태 코드 (기본: 500)
 */
const handleControllerError = (res, error, context, statusCode = 500) => {
  logger.error(`${context}:`, {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
  
  return res.status(statusCode).json({
    success: false,
    message: `${context}에 실패했습니다.`,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

/**
 * 페이지네이션 헬퍼
 * 
 * @param {number} page - 현재 페이지 (1부터 시작)
 * @param {number} limit - 페이지당 항목 수
 * @returns {Object} { offset, limit } Sequelize용
 */
const getPagination = (page = 1, limit = 20) => {
  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 20;
  
  return {
    offset: (parsedPage - 1) * parsedLimit,
    limit: parsedLimit
  };
};

/**
 * 페이지네이션 메타데이터 생성
 * 
 * @param {number} totalCount - 전체 항목 수
 * @param {number} page - 현재 페이지
 * @param {number} limit - 페이지당 항목 수
 * @returns {Object} 페이지네이션 메타데이터
 */
const getPaginationMeta = (totalCount, page = 1, limit = 20) => {
  const totalPages = Math.ceil(totalCount / limit);
  
  return {
    totalCount,
    totalPages,
    currentPage: parseInt(page, 10),
    perPage: parseInt(limit, 10),
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

module.exports = {
  getWorkerDisplayName,
  validateCompanyId,
  validateOwnership,
  formatDate,
  handleControllerError,
  getPagination,
  getPaginationMeta
};

