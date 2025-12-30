// 역할 기반 권한 확인 미들웨어

/**
 * 특정 역할만 접근 가능하도록 제한하는 미들웨어
 * @param {string[]} allowedRoles - 허용할 역할 배열 (예: ['manager'])
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // authMiddleware에서 req.user에 사용자 정보가 저장되어 있어야 함
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: '인증이 필요합니다.'
        });
      }

      const userRole = req.user.role;

      // 사용자의 역할이 허용된 역할 목록에 있는지 확인
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: '이 작업을 수행할 권한이 없습니다.'
        });
      }

      // 권한이 있으면 다음 미들웨어로 진행
      next();
    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: '권한 확인 중 오류가 발생했습니다.'
      });
    }
  };
};

/**
 * 관리자 전용 미들웨어
 */
const requireManager = checkRole(['manager']);

/**
 * 작업반장 전용 미들웨어
 */
const requireForeman = checkRole(['foreman']);

/**
 * 관리자 또는 작업반장 모두 접근 가능
 */
const requireAuthenticated = checkRole(['manager', 'foreman']);

module.exports = {
  checkRole,
  requireManager,
  requireForeman,
  requireAuthenticated
};

