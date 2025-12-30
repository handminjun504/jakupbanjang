const Site = require('../models/Site');
const Task = require('../models/Task');
const User = require('../models/User');
const Company = require('../models/Company');
const Expense = require('../models/Expense');
const Worker = require('../models/Worker');
const SiteForemanAssignment = require('../models/SiteForemanAssignment');
const { decryptRRN } = require('../utils/encryption');

/**
 * 내 기업 정보 조회
 */
const getMyCompany = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const company = await Company.findByPk(companyId, {
      attributes: ['id', 'name', 'inviteCode', 'createdAt']
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: '기업 정보를 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: company
    });
  } catch (error) {
    console.error('Get my company error:', error);
    res.status(500).json({
      success: false,
      message: '기업 정보 조회에 실패했습니다.'
    });
  }
};

/**
 * 현장 관리 - 현장 목록 조회
 */
const getSites = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const sites = await Site.findAll({
      where: { companyId },
      include: [
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'email', 'role']
        },
        {
          model: User,
          as: 'assignedForemen',
          attributes: ['id', 'name', 'phone', 'email'],
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: sites
    });
  } catch (error) {
    console.error('Get sites error:', error);
    res.status(500).json({
      success: false,
      message: '현장 목록 조회에 실패했습니다.'
    });
  }
};

/**
 * 현장 관리 - 새 현장 생성
 */
const createSite = async (req, res) => {
  try {
    const { name, address, startDate, endDate } = req.body;
    const managerId = req.user.id;
    const companyId = req.user.companyId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: '현장명은 필수입니다.'
      });
    }

    const site = await Site.create({
      name,
      address,
      managerId,
      companyId,  // 기업 ID 추가
      startDate,
      endDate,
      status: 'active'
    });

    res.status(201).json({
      success: true,
      message: '현장이 생성되었습니다.',
      data: site
    });
  } catch (error) {
    console.error('Create site error:', error);
    res.status(500).json({
      success: false,
      message: '현장 생성에 실패했습니다.'
    });
  }
};

/**
 * 현장 관리 - 현장 수정
 */
const updateSite = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, status, startDate, endDate } = req.body;

    const site = await Site.findByPk(id);
    
    if (!site) {
      return res.status(404).json({
        success: false,
        message: '현장을 찾을 수 없습니다.'
      });
    }

    await site.update({
      name: name || site.name,
      address: address || site.address,
      status: status || site.status,
      startDate: startDate || site.startDate,
      endDate: endDate || site.endDate
    });

    res.status(200).json({
      success: true,
      message: '현장 정보가 수정되었습니다.',
      data: site
    });
  } catch (error) {
    console.error('Update site error:', error);
    res.status(500).json({
      success: false,
      message: '현장 수정에 실패했습니다.'
    });
  }
};

/**
 * 현장 관리 - 현장 삭제
 */
const deleteSite = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const site = await Site.findOne({
      where: { id, companyId }
    });
    
    if (!site) {
      return res.status(404).json({
        success: false,
        message: '현장을 찾을 수 없습니다.'
      });
    }

    // 현장에 연결된 작업일지가 있는지 확인
    const workLogCount = await Task.count({
      where: { siteId: id }
    });

    if (workLogCount > 0) {
      return res.status(400).json({
        success: false,
        message: `이 현장에는 ${workLogCount}개의 작업일지가 있습니다. 작업일지를 먼저 삭제해주세요.`
      });
    }

    await site.destroy();

    res.status(200).json({
      success: true,
      message: '현장이 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Delete site error:', error);
    res.status(500).json({
      success: false,
      message: '현장 삭제에 실패했습니다.'
    });
  }
};

/**
 * 작업일지 관리 - 모든 작업일지 조회 (companyId 필터링 추가)
 */
const getAllWorkLogs = async (req, res) => {
  try {
    const { siteId, creatorId, startDate, endDate } = req.query;
    const companyId = req.user.companyId;  // 🔧 수정: companyId 추가

    // 동적 필터 구성
    const where = { companyId };  // 🔧 수정: companyId 필수 조건
    if (siteId) where.siteId = siteId;
    if (creatorId) where.creatorId = creatorId;
    if (startDate && endDate) {
      where.createdAt = {
        [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const Attachment = require('../models/Attachment');
    const workLogs = await Task.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'phone', 'role']
        },
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name', 'address']
        },
        {
          model: Worker,
          as: 'worker',
          // 퇴사 여부 확인을 위해 status, resignedDate 포함
          attributes: ['id', 'name', 'phoneNumber', 'dailyRate', 'status', 'resignedDate']
        },
        {
          model: Attachment,
          as: 'attachments',
          attributes: ['id', 'filename', 'file_path', 'file_size', 'mime_type', 'created_at'],
          required: false // LEFT JOIN으로 첨부파일이 없어도 작업일지 조회
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: workLogs
    });
  } catch (error) {
    console.error('Get work logs error:', error);
    res.status(500).json({
      success: false,
      message: '작업일지 조회에 실패했습니다.'
    });
  }
};

/**
 * 근무자 관리 - 모든 근무자 조회 (companyId 필터링 추가)
 */
const getAllWorkers = async (req, res) => {
  try {
    const companyId = req.user.companyId;  // 🔧 수정: companyId 추가

    // 같은 회사의 작업반장만 조회
    const workers = await User.findAll({
      where: { 
        role: 'foreman',
        companyId  // 🔧 수정: companyId 필터링
      },
      attributes: ['id', 'name', 'email', 'phone', 'role', 'dailyRate', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: workers
    });
  } catch (error) {
    console.error('Get workers error:', error);
    res.status(500).json({
      success: false,
      message: '근무자 목록 조회에 실패했습니다.'
    });
  }
};

/**
 * 대시보드 통계 (companyId 필터링 추가)
 */
const getDashboardStats = async (req, res) => {
  try {
    const companyId = req.user.companyId;  // 🔧 수정: companyId 추가

    // 오늘 날짜
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 통계 데이터 수집 (같은 기업의 데이터만)
    const [
      totalSites,
      activeSites,
      totalWorkLogs,
      todayWorkLogs,
      totalWorkers
    ] = await Promise.all([
      Site.count({ where: { companyId } }),  // 🔧 수정
      Site.count({ where: { status: 'active', companyId } }),  // 🔧 수정
      Task.count({ where: { companyId } }),  // 🔧 수정
      Task.count({
        where: {
          companyId,  // 🔧 수정
          createdAt: {
            [require('sequelize').Op.between]: [today, tomorrow]
          }
        }
      }),
      User.count({ where: { role: 'foreman', companyId } })  // 🔧 수정
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSites,
        activeSites,
        totalWorkLogs,
        todayWorkLogs,
        totalWorkers
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: '대시보드 통계 조회에 실패했습니다.'
    });
  }
};

/**
 * 지출결의 목록 조회 (관리자용 - 모든 지출결의)
 */
const getAllExpenses = async (req, res) => {
  try {
    const { status, siteId } = req.query;
    const companyId = req.user.companyId;

    const whereClause = { companyId };
    if (status) {
      whereClause.status = status;
    }
    if (siteId) {
      whereClause.siteId = siteId;
    }

    const expenses = await Expense.findAll({
      where: whereClause,
      include: [
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name', 'address']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'phone', 'role']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'email', 'role']
        }
      ],
      order: [['expenseDate', 'DESC'], ['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: expenses
    });
  } catch (error) {
    console.error('Get all expenses error:', error);
    res.status(500).json({
      success: false,
      message: '지출결의 목록 조회에 실패했습니다.'
    });
  }
};

/**
 * 지출결의 승인
 */
const approveExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const approverId = req.user.id;
    const companyId = req.user.companyId;

    // 지출결의 조회
    const expense = await Expense.findOne({ 
      where: { id, companyId } 
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: '지출결의를 찾을 수 없습니다.'
      });
    }

    // 이미 처리된 경우
    if (expense.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '이미 처리된 지출결의입니다.'
      });
    }

    // 승인 처리
    await expense.update({
      status: 'approved',
      approverId,
      approvalDate: new Date()
    });

    // 업데이트된 정보 조회
    const updatedExpense = await Expense.findByPk(id, {
      include: [
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name', 'address']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'phone', 'role']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'email', 'role']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: '지출결의가 승인되었습니다.',
      data: updatedExpense
    });
  } catch (error) {
    console.error('Approve expense error:', error);
    res.status(500).json({
      success: false,
      message: '지출결의 승인에 실패했습니다.',
      error: error.message
    });
  }
};

/**
 * 지출결의 거절
 */
const rejectExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectReason } = req.body;
    const approverId = req.user.id;
    const companyId = req.user.companyId;

    // 거절 사유 검증
    if (!rejectReason || !rejectReason.trim()) {
      return res.status(400).json({
        success: false,
        message: '거절 사유를 입력해주세요.'
      });
    }

    // 지출결의 조회
    const expense = await Expense.findOne({ 
      where: { id, companyId } 
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: '지출결의를 찾을 수 없습니다.'
      });
    }

    // 이미 처리된 경우
    if (expense.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: '이미 처리된 지출결의입니다.'
      });
    }

    // 거절 처리
    await expense.update({
      status: 'rejected',
      approverId,
      approvalDate: new Date(),
      rejectReason: rejectReason.trim()
    });

    // 업데이트된 정보 조회
    const updatedExpense = await Expense.findByPk(id, {
      include: [
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name', 'address']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email', 'phone', 'role']
        },
        {
          model: User,
          as: 'approver',
          attributes: ['id', 'email', 'role']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: '지출결의가 거절되었습니다.',
      data: updatedExpense
    });
  } catch (error) {
    console.error('Reject expense error:', error);
    res.status(500).json({
      success: false,
      message: '지출결의 거절에 실패했습니다.',
      error: error.message
    });
  }
};

/**
 * 특정 작업반장이 등록한 근무자 목록 조회
 */
const getForemanWorkers = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // 작업반장이 같은 회사에 속하는지 확인
    const foreman = await User.findOne({
      where: {
        id,
        companyId,
        role: 'foreman'
      }
    });

    if (!foreman) {
      return res.status(404).json({
        success: false,
        message: '작업반장을 찾을 수 없습니다.'
      });
    }

    // 해당 작업반장이 등록한 근무자 목록 조회 (암호화된 rrn 포함)
    const workers = await Worker.findAll({
      where: {
        foremanId: id,
        companyId,
        status: 'active'
      },
      attributes: ['id', 'name', 'rrn', 'rrnDisplay', 'phoneNumber', 'dailyRate', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // 주민번호 복호화하여 반환 (관리자만 가능)
    const workersWithDecryptedRRN = workers.map(worker => {
      try {
        const decryptedRRN = decryptRRN(worker.rrn);
        return {
          id: worker.id,
          name: worker.name,
          rrn: decryptedRRN, // 복호화된 주민번호
          rrnDisplay: worker.rrnDisplay,
          phoneNumber: worker.phoneNumber,
          dailyRate: worker.dailyRate,
          createdAt: worker.createdAt
        };
      } catch (error) {
        console.error('RRN decryption error for worker:', worker.id, error);
        // 복호화 실패 시 마스킹된 값만 반환
        return {
          id: worker.id,
          name: worker.name,
          rrn: worker.rrnDisplay, // 복호화 실패 시 마스킹된 값
          rrnDisplay: worker.rrnDisplay,
          phoneNumber: worker.phoneNumber,
          dailyRate: worker.dailyRate,
          createdAt: worker.createdAt
        };
      }
    });

    res.status(200).json({
      success: true,
      data: workersWithDecryptedRRN
    });
  } catch (error) {
    console.error('Get foreman workers error:', error);
    res.status(500).json({
      success: false,
      message: '근무자 목록 조회에 실패했습니다.',
      error: error.message
    });
  }
};

/**
 * 작업반장 단가 업데이트
 */
const updateForemanDailyRate = async (req, res) => {
  try {
    const { id } = req.params;
    const { dailyRate } = req.body;
    const companyId = req.user.companyId;

    // 입력 검증
    if (dailyRate === undefined || dailyRate === null) {
      return res.status(400).json({
        success: false,
        message: '단가를 입력해주세요.'
      });
    }

    if (dailyRate < 0) {
      return res.status(400).json({
        success: false,
        message: '단가는 0 이상이어야 합니다.'
      });
    }

    // 작업반장 찾기 (같은 회사의 작업반장만)
    const foreman = await User.findOne({
      where: {
        id,
        companyId,
        role: 'foreman'
      }
    });

    if (!foreman) {
      return res.status(404).json({
        success: false,
        message: '작업반장을 찾을 수 없습니다.'
      });
    }

    // 단가 업데이트
    await foreman.update({ dailyRate: parseInt(dailyRate) });

    res.status(200).json({
      success: true,
      message: '작업반장 단가가 업데이트되었습니다.',
      data: {
        id: foreman.id,
        name: foreman.name,
        phone: foreman.phone,
        dailyRate: foreman.dailyRate
      }
    });
  } catch (error) {
    console.error('Update foreman daily rate error:', error);
    res.status(500).json({
      success: false,
      message: '단가 업데이트에 실패했습니다.',
      error: error.message
    });
  }
};

/**
 * 작업일지 지급 완료 처리
 */
const markWorkLogsAsPaid = async (req, res) => {
  try {
    const { workLogIds, paymentDate } = req.body;
    const companyId = req.user.companyId;
    const managerId = req.user.id;

    // 입력 검증
    if (!workLogIds || !Array.isArray(workLogIds) || workLogIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: '작업일지 ID가 필요합니다.'
      });
    }

    if (!paymentDate) {
      return res.status(400).json({
        success: false,
        message: '지급일자를 입력해주세요.'
      });
    }

    // 해당 작업일지들이 같은 회사에 속하는지 확인
    const workLogs = await Task.findAll({
      where: {
        id: workLogIds,
        companyId
      }
    });

    if (workLogs.length !== workLogIds.length) {
      return res.status(404).json({
        success: false,
        message: '일부 작업일지를 찾을 수 없습니다.'
      });
    }

    // 일괄 업데이트
    await Task.update(
      {
        paymentStatus: '지급완료',
        paymentDate: paymentDate,
        paymentBy: managerId
      },
      {
        where: {
          id: workLogIds,
          companyId
        }
      }
    );

    res.status(200).json({
      success: true,
      message: '지급 완료 처리되었습니다.',
      data: {
        updatedCount: workLogIds.length,
        paymentDate
      }
    });
  } catch (error) {
    console.error('Mark work logs as paid error:', error);
    res.status(500).json({
      success: false,
      message: '지급 처리에 실패했습니다.',
      error: error.message
    });
  }
};

/**
 * 집계 데이터 조회 (작업일지 + 지출결의)
 */
const getAggregationData = async (req, res) => {
  try {
    const { 
      type,           // 'worklog' | 'expense' | 'all'
      startDate, 
      endDate, 
      siteId, 
      creatorId,      // 반장 ID
      workerId,       // 근무자 ID
      paymentStatus   // '미지급' | '지급완료' | 'all'
    } = req.query;
    
    const companyId = req.user.companyId;
    const { Op } = require('sequelize');

    let workLogsData = [];
    let expensesData = [];
    let summary = {
      totalAmount: 0,
      totalCount: 0,
      workLogAmount: 0,
      workLogCount: 0,
      expenseAmount: 0,
      expenseCount: 0,
      paidAmount: 0,
      unpaidAmount: 0
    };

    // 작업일지 조회
    if (type === 'worklog' || type === 'all') {
      const workLogWhere = { companyId };
      
      // 날짜 필터
      if (startDate && endDate) {
        workLogWhere.workDate = {
          [Op.between]: [startDate, endDate]
        };
      }
      
      // 현장 필터
      if (siteId) {
        workLogWhere.siteId = parseInt(siteId);
      }
      
      // 반장 필터
      if (creatorId) {
        workLogWhere.creatorId = parseInt(creatorId);
      }
      
      // 근무자 필터
      if (workerId) {
        workLogWhere.workerId = parseInt(workerId);
      }
      
      // 지급 상태 필터
      if (paymentStatus && paymentStatus !== 'all') {
        workLogWhere.paymentStatus = paymentStatus;
      }

      workLogsData = await Task.findAll({
        where: workLogWhere,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email', 'phone', 'role']
          },
          {
            model: Site,
            as: 'site',
            attributes: ['id', 'name', 'address']
          },
          {
            model: Worker,
            as: 'worker',
            attributes: ['id', 'name', 'phoneNumber', 'dailyRate']
          }
        ],
        order: [['workDate', 'DESC'], ['createdAt', 'DESC']]
      });

      // 작업일지 집계 계산
      workLogsData.forEach(log => {
        const amount = (log.dailyRate || 0) * (log.effort || 0);
        summary.workLogAmount += amount;
        summary.workLogCount++;
        
        if (log.paymentStatus === '지급완료') {
          summary.paidAmount += amount;
        } else {
          summary.unpaidAmount += amount;
        }
      });
    }

    // 지출결의 조회
    if (type === 'expense' || type === 'all') {
      const expenseWhere = { companyId };
      
      // 날짜 필터
      if (startDate && endDate) {
        expenseWhere.expenseDate = {
          [Op.between]: [startDate, endDate]
        };
      }
      
      // 현장 필터
      if (siteId) {
        expenseWhere.siteId = parseInt(siteId);
      }
      
      // 반장 필터 (지출결의는 creatorId로 필터링)
      if (creatorId) {
        expenseWhere.creatorId = parseInt(creatorId);
      }
      
      // 지급 상태 필터 (지출결의는 status로 매핑)
      // 'approved' = 지급완료, 'pending'/'rejected' = 미지급으로 간주
      if (paymentStatus === '지급완료') {
        expenseWhere.status = 'approved';
      } else if (paymentStatus === '미지급') {
        expenseWhere.status = {
          [Op.in]: ['pending', 'rejected']
        };
      }

      expensesData = await Expense.findAll({
        where: expenseWhere,
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name', 'email', 'phone', 'role']
          },
          {
            model: Site,
            as: 'site',
            attributes: ['id', 'name', 'address']
          }
        ],
        order: [['expenseDate', 'DESC'], ['createdAt', 'DESC']]
      });

      // 지출결의 집계 계산
      expensesData.forEach(expense => {
        const amount = expense.amount || 0;
        summary.expenseAmount += amount;
        summary.expenseCount++;
        
        if (expense.status === 'approved') {
          summary.paidAmount += amount;
        } else {
          summary.unpaidAmount += amount;
        }
      });
    }

    // 총 집계
    summary.totalAmount = summary.workLogAmount + summary.expenseAmount;
    summary.totalCount = summary.workLogCount + summary.expenseCount;

    // 상세 데이터 포맷팅
    const workLogsFormatted = workLogsData.map(log => ({
      id: log.id,
      type: 'worklog',
      date: log.workDate,
      site: log.site,
      creator: log.creator,
      worker: log.worker,
      description: log.description,
      effort: log.effort,
      dailyRate: log.dailyRate,
      amount: (log.dailyRate || 0) * (log.effort || 0),
      paymentStatus: log.paymentStatus,
      paymentDate: log.paymentDate,
      createdAt: log.createdAt
    }));

    const expensesFormatted = expensesData.map(expense => ({
      id: expense.id,
      type: 'expense',
      date: expense.expenseDate,
      site: expense.site,
      creator: expense.creator,
      title: expense.title,
      content: expense.content,
      amount: expense.amount,
      paymentStatus: expense.status === 'approved' ? '지급완료' : '미지급',
      status: expense.status,
      createdAt: expense.createdAt
    }));

    // 통합 데이터 (날짜순 정렬)
    const allData = [...workLogsFormatted, ...expensesFormatted].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    res.status(200).json({
      success: true,
      data: {
        summary,
        workLogs: workLogsFormatted,
        expenses: expensesFormatted,
        allData
      }
    });
  } catch (error) {
    console.error('Get aggregation data error:', error);
    res.status(500).json({
      success: false,
      message: '집계 데이터 조회에 실패했습니다.',
      error: error.message
    });
  }
};

/**
 * 작업반장 목록 조회 (같은 회사의 작업반장만)
 */
const getForemen = async (req, res) => {
  try {
    const companyId = req.user.companyId;

    const foremen = await User.findAll({
      where: { 
        companyId,
        role: 'foreman'
      },
      attributes: ['id', 'name', 'phone', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: foremen
    });
  } catch (error) {
    console.error('Get foremen error:', error);
    res.status(500).json({
      success: false,
      message: '작업반장 목록 조회에 실패했습니다.'
    });
  }
};

/**
 * 현장에 작업반장 할당
 */
const assignForemenToSite = async (req, res) => {
  try {
    const { id } = req.params; // siteId
    const { foremanIds } = req.body; // 할당할 작업반장 ID 배열
    const managerId = req.user.id;
    const companyId = req.user.companyId;

    // 현장 확인
    const site = await Site.findOne({
      where: { id, companyId }
    });

    if (!site) {
      return res.status(404).json({
        success: false,
        message: '현장을 찾을 수 없습니다.'
      });
    }

    // 작업반장 ID가 배열인지 확인
    if (!Array.isArray(foremanIds)) {
      return res.status(400).json({
        success: false,
        message: '작업반장 ID는 배열이어야 합니다.'
      });
    }

    // 기존 할당 삭제
    await SiteForemanAssignment.destroy({
      where: { siteId: id }
    });

    // 새로운 할당 생성
    if (foremanIds.length > 0) {
      const assignments = foremanIds.map(foremanId => ({
        siteId: id,
        foremanId,
        assignedBy: managerId
      }));

      await SiteForemanAssignment.bulkCreate(assignments);
    }

    // 할당된 작업반장 정보와 함께 현장 정보 반환
    const updatedSite = await Site.findByPk(id, {
      include: [{
        model: User,
        as: 'assignedForemen',
        attributes: ['id', 'name', 'phone', 'email'],
        through: { attributes: [] }
      }]
    });

    res.status(200).json({
      success: true,
      message: '작업반장이 할당되었습니다.',
      data: updatedSite
    });
  } catch (error) {
    console.error('Assign foremen to site error:', error);
    res.status(500).json({
      success: false,
      message: '작업반장 할당에 실패했습니다.'
    });
  }
};

module.exports = {
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
};

