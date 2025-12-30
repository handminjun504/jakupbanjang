const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// POST / - 작업 생성
router.post('/', taskController.createTask);

// GET / - 작업 목록 조회
router.get('/', taskController.getAllTasks);

// PATCH /:id/status - 작업 상태 업데이트
router.patch('/:id/status', taskController.updateTaskStatus);

// DELETE /:id - 작업 삭제
router.delete('/:id', taskController.deleteTask);

module.exports = router;

