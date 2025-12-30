const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { requireManager } = require('../middlewares/roleMiddleware');
const {
  getMyCompany,
  getSites,
  createSite,
  updateSite,
  deleteSite,
  getAllWorkLogs,
  getAllWorkers,
  getForemanWorkers,
  getDashboardStats,
  getAllExpenses,
  approveExpense,
  rejectExpense,
  updateForemanDailyRate,
  markWorkLogsAsPaid,
  getAggregationData,
  getForemen,
  assignForemenToSite
} = require('../controllers/adminController');

// 모든 /api/admin 라우트는 JWT 인증 + 관리자 권한 필요
router.use(authMiddleware);
router.use(requireManager);

// 내 기업 정보
router.get('/my-company', getMyCompany);

// 대시보드 통계
router.get('/dashboard/stats', getDashboardStats);

// 현장 관리
router.get('/sites', getSites);
router.post('/sites', createSite);
router.put('/sites/:id', updateSite);
router.delete('/sites/:id', deleteSite);
router.post('/sites/:id/assign-foremen', assignForemenToSite);

// 작업반장 목록
router.get('/foremen', getForemen);

// 작업일지 조회
router.get('/worklogs', getAllWorkLogs);
// 작업일지 지급 완료 처리
router.put('/worklogs/mark-as-paid', markWorkLogsAsPaid);

// 근무자 조회
router.get('/workers', getAllWorkers);

// 작업반장 관리
router.get('/foremen/:id/workers', getForemanWorkers);
router.put('/foremen/:id/dailyrate', updateForemanDailyRate);

// 지출결의 관리
router.get('/expenses', getAllExpenses);
router.put('/expenses/:id/approve', approveExpense);
router.put('/expenses/:id/reject', rejectExpense);

// 집계 데이터
router.get('/aggregation', getAggregationData);

module.exports = router;

