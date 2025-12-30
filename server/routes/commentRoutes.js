const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middlewares/authMiddleware');

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// POST /api/tasks/:taskId/comments - 댓글 생성
router.post('/tasks/:taskId/comments', commentController.createComment);

// GET /api/tasks/:taskId/comments - 작업의 댓글 목록 조회
router.get('/tasks/:taskId/comments', commentController.getCommentsByTask);

// PUT /api/tasks/:taskId/comments/:commentId - 댓글 수정
router.put('/tasks/:taskId/comments/:commentId', commentController.updateComment);

// DELETE /api/tasks/:taskId/comments/:commentId - 댓글 삭제
router.delete('/tasks/:taskId/comments/:commentId', commentController.deleteComment);

module.exports = router;

