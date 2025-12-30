const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const logger = require('../config/logger');
const { 
  successResponse, 
  createdResponse, 
  errorResponse, 
  validationErrorResponse,
  unauthorizedResponse 
} = require('../utils/responseFormatter');

/**
 * 작업반장 회원가입 (초대 코드 사용, 휴대폰 번호로 가입)
 */
exports.signupForeman = async (req, res) => {
  try {
    const { name, phone, password, inviteCode } = req.body;

    // 입력 검증
    if (!name || !phone || !password || !inviteCode) {
      logger.warn(`작업반장 회원가입 실패: 필수 항목 누락 - name: ${!!name}, phone: ${!!phone}, password: ${!!password}, inviteCode: ${!!inviteCode}`);
      return validationErrorResponse(res, [
        { field: 'name', message: '이름은 필수입니다.' },
        { field: 'phone', message: '휴대폰 번호는 필수입니다.' },
        { field: 'password', message: '비밀번호는 필수입니다.' },
        { field: 'inviteCode', message: '초대 코드는 필수입니다.' }
      ].filter(err => !req.body[err.field]));
    }

    // 전화번호 정규화 (하이픈, 공백 제거 - 숫자만)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    
    if (cleanPhone.length !== 11 && cleanPhone.length !== 10) {
      logger.warn(`작업반장 회원가입 실패: 유효하지 않은 전화번호 형식 - ${phone}`);
      return errorResponse(res, '유효하지 않은 전화번호 형식입니다.', 400);
    }

    // 초대 코드로 기업 찾기
    const company = await Company.findOne({ where: { inviteCode } });

    if (!company) {
      logger.warn(`작업반장 회원가입 실패: 유효하지 않은 초대 코드 - ${inviteCode}`);
      return errorResponse(res, '유효하지 않은 초대 코드입니다.', 400);
    }

    // 휴대폰 번호 중복 체크 (정규화된 번호로)
    const existingUser = await User.findOne({ where: { phone: cleanPhone } });
    if (existingUser) {
      logger.warn(`작업반장 회원가입 실패: 중복 휴대폰 번호 - ${cleanPhone}`);
      return errorResponse(res, '이미 사용 중인 휴대폰 번호입니다.', 400);
    }

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 작업반장 사용자 생성 (정규화된 전화번호 사용)
    const newUser = await User.create({
      name: name.trim(),
      phone: cleanPhone,
      password: hashedPassword,
      role: 'foreman',
      companyId: company.id,
      dailyRate: 0
    });

    logger.info(`작업반장 회원가입 성공: userId=${newUser.id}, companyId=${company.id}, phone=${cleanPhone}`);

    // 비밀번호 제외하고 사용자 정보 반환
    const userResponse = {
      id: newUser.id,
      phone: newUser.phone,
      role: newUser.role,
      companyId: newUser.companyId,
      companyName: company.name,
      createdAt: newUser.createdAt
    };

    return createdResponse(res, userResponse, `${company.name}에 작업반장으로 가입되었습니다.`);

  } catch (error) {
    logger.error(`작업반장 회원가입 오류: ${error.message}`);
    logger.error(error.stack);
    return errorResponse(res, '회원가입 중 오류가 발생했습니다.', 500);
  }
};

/**
 * 관리자 회원가입 (새 기업 생성)
 */
exports.signupManager = async (req, res) => {
  try {
    const { email, password, companyName } = req.body;

    // 입력 검증
    if (!email || !password || !companyName) {
      logger.warn('관리자 회원가입 실패: 필수 항목 누락');
      return validationErrorResponse(res, [
        { field: 'email', message: '이메일은 필수입니다.' },
        { field: 'password', message: '비밀번호는 필수입니다.' },
        { field: 'companyName', message: '기업명은 필수입니다.' }
      ].filter(err => !req.body[err.field]));
    }

    // 이메일 중복 체크
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      logger.warn(`관리자 회원가입 실패: 중복 이메일 - ${email}`);
      return errorResponse(res, '이미 사용 중인 이메일입니다.', 400);
    }

    // 새 기업 생성 (inviteCode는 자동 생성됨)
    const newCompany = await Company.create({
      name: companyName
    });

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 관리자 사용자 생성
    const newUser = await User.create({
      email,
      password: hashedPassword,
      role: 'manager',
      companyId: newCompany.id
    });

    logger.info(`관리자 회원가입 성공: userId=${newUser.id}, companyId=${newCompany.id}, inviteCode=${newCompany.inviteCode}`);

    // 비밀번호 제외하고 사용자 정보 반환
    const responseData = {
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        companyId: newUser.companyId,
        createdAt: newUser.createdAt
      },
      company: {
        id: newCompany.id,
        name: newCompany.name,
        inviteCode: newCompany.inviteCode
      }
    };

    return createdResponse(res, responseData, `${companyName} 기업이 생성되었습니다.`);

  } catch (error) {
    logger.error(`관리자 회원가입 오류: ${error.message}`);
    logger.error(error.stack);
    return errorResponse(res, '회원가입 중 오류가 발생했습니다.', 500);
  }
};

/**
 * 로그인 (작업반장=휴대폰, 관리자=이메일)
 */
exports.login = async (req, res) => {
  try {
    const { identifier, password, userType } = req.body; // identifier: email 또는 phone

    // 입력 검증
    if (!identifier || !password || !userType) {
      logger.warn('로그인 실패: 필수 항목 누락');
      return validationErrorResponse(res, [
        { field: 'identifier', message: '이메일 또는 휴대폰 번호는 필수입니다.' },
        { field: 'password', message: '비밀번호는 필수입니다.' },
        { field: 'userType', message: '사용자 유형은 필수입니다.' }
      ].filter(err => !req.body[err.field]));
    }

    // userType에 따라 조회 조건 결정
    let whereClause;
    if (userType === 'foreman') {
      // 전화번호 정규화 (하이픈, 공백 제거)
      const cleanPhone = identifier.replace(/[^0-9]/g, '');
      whereClause = { phone: cleanPhone };
    } else if (userType === 'manager') {
      whereClause = { email: identifier };
    } else {
      logger.warn(`로그인 실패: 유효하지 않은 사용자 유형 - ${userType}`);
      return errorResponse(res, '유효하지 않은 사용자 유형입니다.', 400);
    }

    // 사용자 조회 (Company 정보도 함께)
    const user = await User.findOne({ 
      where: whereClause,
      include: [
        {
          model: Company,
          as: 'company',
          attributes: ['id', 'name', 'inviteCode']
        }
      ]
    });

    if (!user) {
      logger.warn(`로그인 실패: 사용자 없음 - ${identifier}, userType=${userType}`);
      return unauthorizedResponse(res, '로그인 정보가 올바르지 않습니다.');
    }

    // 역할 확인
    if (user.role !== userType) {
      logger.warn(`로그인 실패: 역할 불일치 - userId=${user.id}, expected=${userType}, actual=${user.role}`);
      return unauthorizedResponse(res, '선택한 사용자 유형이 올바르지 않습니다.');
    }

    // 비밀번호 비교
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      logger.warn(`로그인 실패: 비밀번호 불일치 - userId=${user.id}`);
      return unauthorizedResponse(res, '로그인 정보가 올바르지 않습니다.');
    }

    // JWT 생성 (companyId 포함)
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        phone: user.phone,
        role: user.role,
        companyId: user.companyId
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    logger.info(`로그인 성공: userId=${user.id}, role=${user.role}, companyId=${user.companyId}`);

    const responseData = {
      token,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        companyId: user.companyId,
        company: user.company
      }
    };

    return successResponse(res, responseData, '로그인 성공', 200);

  } catch (error) {
    logger.error(`로그인 오류: ${error.message}`);
    logger.error(error.stack);
    return errorResponse(res, '로그인 중 오류가 발생했습니다.', 500);
  }
};

// 레거시 signup 함수 (호환성 유지)
exports.signup = exports.signupForeman;
