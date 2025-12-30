const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ 
        message: '인증 토큰이 제공되지 않았습니다.' 
      });
    }

    // Bearer 토큰 형식 확인
    const token = authHeader.startsWith('Bearer ') 
      ? authHeader.substring(7) 
      : authHeader;

    if (!token) {
      return res.status(401).json({ 
        message: '유효하지 않은 토큰 형식입니다.' 
      });
    }

    // JWT 검증
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // 디코드된 사용자 정보를 req.user에 저장 (companyId 포함)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      companyId: decoded.companyId
    };

    // companyId 필수 체크
    if (!req.user.companyId) {
      return res.status(403).json({ 
        message: '기업 정보가 없는 사용자입니다. 다시 로그인해주세요.' 
      });
    }

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: '유효하지 않은 토큰입니다.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: '토큰이 만료되었습니다. 다시 로그인해주세요.' 
      });
    }
    
    return res.status(500).json({ 
      message: '인증 처리 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
};

module.exports = authMiddleware;

