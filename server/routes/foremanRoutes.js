const express = require('express');
const router = express.Router();
const foremanController = require('../controllers/foremanController');
const authMiddleware = require('../middlewares/authMiddleware');
const { requireForeman } = require('../middlewares/roleMiddleware');
const { uploadExpense } = require('../config/multer');  // multer 추가

// 모든 라우트에 인증 미들웨어 적용
router.use(authMiddleware);
router.use(requireForeman);

// GET /api/foreman/sites - 현장 목록 조회
router.get('/sites', foremanController.getSites);

// POST /api/foreman/workers - 근무자 추가
router.post('/workers', foremanController.createWorker);

// GET /api/foreman/workers - 현장별 근무자 목록 조회
router.get('/workers', foremanController.getWorkersBySite);

// PUT /api/foreman/workers/:id - 근무자 정보 수정
router.put('/workers/:id', foremanController.updateWorker);

// DELETE /api/foreman/workers/:id - 근무자 삭제 (레거시, 퇴사 처리로 대체됨)
router.delete('/workers/:id', foremanController.deleteWorker);

// PUT /api/foreman/workers/:id/resign - 근무자 퇴사 처리 (권장)
router.put('/workers/:id/resign', foremanController.resignWorker);

// GET /api/foreman/tasks - 현장별 작업 목록 조회
router.get('/tasks', foremanController.getTasksBySite);

// POST /api/foreman/worklogs - 작업일지 등록 (파일 첨부 지원)
router.post('/worklogs', upload.array('attachments', 10), foremanController.createWorkLog);

// GET /api/foreman/worklogs - 작업일지 목록 조회
router.get('/worklogs', foremanController.getWorkLogs);

// PUT /api/foreman/worklogs/:id - 작업일지 수정
router.put('/worklogs/:id', foremanController.updateWorkLog);

// DELETE /api/foreman/worklogs/:id - 작업일지 삭제
router.delete('/worklogs/:id', foremanController.deleteWorkLog);

// GET /api/foreman/workers-list - 근무자 목록 조회 (간단 버전)
router.get('/workers-list', foremanController.getWorkersList);

// POST /api/foreman/expenses - 지출결의 등록 (파일 첨부 지원)
router.post('/expenses', uploadExpense.single('file'), foremanController.createExpense);

// GET /api/foreman/expenses - 지출결의 목록 조회
router.get('/expenses', foremanController.getExpenses);

module.exports = router;

