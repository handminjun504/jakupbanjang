const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// POST /api/auth/signup - 회원가입 (레거시, 작업반장으로 처리)
router.post('/signup', authController.signup);

// POST /api/auth/signup-foreman - 작업반장 회원가입 (초대 코드 사용)
router.post('/signup-foreman', authController.signupForeman);

// POST /api/auth/signup-manager - 관리자 회원가입 (새 기업 생성)
router.post('/signup-manager', authController.signupManager);

// POST /api/auth/login - 로그인
router.post('/login', authController.login);

module.exports = router;

