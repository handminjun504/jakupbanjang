const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/multer');

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);

// POST /api/tasks/:taskId/attachments - 첨부파일 업로드
router.post('/tasks/:taskId/attachments', upload.single('file'), attachmentController.uploadAttachment);

// GET /api/tasks/:taskId/attachments - 작업의 첨부파일 목록 조회
router.get('/tasks/:taskId/attachments', attachmentController.getAttachmentsByTask);

// GET /api/tasks/:taskId/attachments/:attachmentId/download - 첨부파일 다운로드
router.get('/tasks/:taskId/attachments/:attachmentId/download', attachmentController.downloadAttachment);

// DELETE /api/tasks/:taskId/attachments/:attachmentId - 첨부파일 삭제
router.delete('/tasks/:taskId/attachments/:attachmentId', attachmentController.deleteAttachment);

module.exports = router;

