const Worker = require('../models/Worker');
const Site = require('../models/Site');
const Task = require('../models/Task');
const User = require('../models/User');
const Expense = require('../models/Expense');
const SiteForemanAssignment = require('../models/SiteForemanAssignment');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { validateRRN } = require('../utils/rrnValidator');
const { encryptRRN, decryptRRN, maskRRN } = require('../utils/encryption');

/**
 * 현장 목록 조회 (작업반장용 - 할당된 현장만)
 */
exports.getSites = async (req, res) => {
  try {
    const foremanId = req.user.id;
    const companyId = req.user.companyId;

    // 할당된 현장 ID 조회
    const assignments = await SiteForemanAssignment.findAll({
      where: { foremanId },
      attributes: ['siteId']
    });

    const assignedSiteIds = assignments.map(a => a.siteId);

    // 할당된 현장이 없으면 빈 배열 반환
    if (assignedSiteIds.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    // 할당된 현장 정보 조회
    const sites = await Site.findAll({
      where: { 
        id: assignedSiteIds,
        companyId,  // 기업별 격리
        status: 'active' 
      },
      attributes: ['id', 'name', 'address', 'startDate', 'endDate', 'status'],
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
 * 근무자 추가 (작업반장별 통합 관리)
 */
exports.createWorker = async (req, res) => {
  try {
    const { name, rrn, phoneNumber, dailyRate, remarks } = req.body;
    const foremanId = req.user.id;
    const companyId = req.user.companyId;

    // 필수 필드 검증
    if (!name || !rrn) {
      return res.status(400).json({
        success: false,
        message: '이름과 주민등록번호는 필수 항목입니다.'
      });
    }

    // 주민등록번호 형식 검증 (하이픈 제거)
    const cleanRRN = rrn.replace(/-/g, '');
    
    // 주민등록번호 유효성 검사
    if (!validateRRN(cleanRRN)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 주민등록번호입니다.'
      });
    }

    // 주민번호 해시 생성 (중복 체크용 - SHA256)
    const rrnHash = crypto.createHash('sha256').update(cleanRRN).digest('hex');

    // 주민번호 중복 체크 (같은 작업반장이 등록한 활성 근무자만 검사)
    const existingWorker = await Worker.findOne({ 
      where: { 
        rrnHash,
        foremanId,
        status: 'active'
      } 
    });
    if (existingWorker) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 주민등록번호입니다.'
      });
    }

    // 주민번호 암호화 (AES - 양방향 암호화, 복호화 가능)
    const encryptedRRN = encryptRRN(cleanRRN);

    // 주민번호 마스킹 (표시용: 123456-1******)
    const rrnDisplay = maskRRN(cleanRRN);

    // 근무자 생성
    const worker = await Worker.create({
      name,
      rrn: encryptedRRN,
      rrnHash: rrnHash,
      rrnDisplay: rrnDisplay,
      phoneNumber,
      dailyRate: dailyRate ? parseInt(dailyRate) : null,
      remarks,
      foremanId,
      companyId,
      status: 'active'
    });

    // 생성된 근무자 정보 반환 (rrn 제외)
    const workerResponse = {
      id: worker.id,
      name: worker.name,
      phoneNumber: worker.phoneNumber,
      dailyRate: worker.dailyRate,
      remarks: worker.remarks,
      status: worker.status,
      createdAt: worker.createdAt
    };

    res.status(201).json({
      success: true,
      message: '근무자가 추가되었습니다.',
      data: workerResponse
    });
  } catch (error) {
    console.error('Create worker error:', error);
    res.status(500).json({
      success: false,
      message: '근무자 추가에 실패했습니다.',
      error: error.message
    });
  }
};

/**
 * 근무자 목록 조회 (작업반장별 통합 관리)
 */
exports.getWorkersBySite = async (req, res) => {
  try {
    const foremanId = req.user.id;

    const workers = await Worker.findAll({
      where: { foremanId, status: 'active' },
      attributes: ['id', 'name', 'rrn', 'phoneNumber', 'dailyRate', 'remarks', 'status', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // 주민번호 복호화하여 반환 (작업반장은 본인이 등록한 근무자만 조회 가능)
    const workersWithDecryptedRRN = workers.map(worker => {
      try {
        const decryptedRRN = decryptRRN(worker.rrn);
        return {
          id: worker.id,
          name: worker.name,
          rrn: decryptedRRN, // 복호화된 주민번호
          phoneNumber: worker.phoneNumber,
          dailyRate: worker.dailyRate,
          remarks: worker.remarks,
          status: worker.status,
          createdAt: worker.createdAt
        };
      } catch (error) {
        console.error('RRN decryption error for worker:', worker.id, error);
        // 복호화 실패 시 마스킹된 값 반환
        return {
          id: worker.id,
          name: worker.name,
          rrn: maskRRN(worker.rrn), // 복호화 실패 시 마스킹
          phoneNumber: worker.phoneNumber,
          dailyRate: worker.dailyRate,
          remarks: worker.remarks,
          status: worker.status,
          createdAt: worker.createdAt
        };
      }
    });

    res.status(200).json({
      success: true,
      data: workersWithDecryptedRRN
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
 * 근무자 정보 수정
 */
exports.updateWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, dailyRate, remarks, status } = req.body;
    const foremanId = req.user.id;

    const worker = await Worker.findByPk(id);
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: '근무자를 찾을 수 없습니다.'
      });
    }

    // 권한 확인 (본인이 등록한 근무자만 수정 가능)
    if (worker.foremanId !== foremanId) {
      return res.status(403).json({
        success: false,
        message: '해당 근무자를 수정할 권한이 없습니다.'
      });
    }

    // 업데이트 (주민번호는 수정 불가)
    await worker.update({
      name: name || worker.name,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : worker.phoneNumber,
      dailyRate: dailyRate !== undefined ? parseInt(dailyRate) : worker.dailyRate,
      remarks: remarks !== undefined ? remarks : worker.remarks,
      status: status || worker.status
    });

    // 수정된 근무자 정보 반환 (rrn 제외)
    const updatedWorkerResponse = {
      id: worker.id,
      name: worker.name,
      phoneNumber: worker.phoneNumber,
      dailyRate: worker.dailyRate,
      remarks: worker.remarks,
      status: worker.status,
      updatedAt: worker.updatedAt
    };

    res.status(200).json({
      success: true,
      message: '근무자 정보가 수정되었습니다.',
      data: updatedWorkerResponse
    });
  } catch (error) {
    console.error('Update worker error:', error);
    res.status(500).json({
      success: false,
      message: '근무자 정보 수정에 실패했습니다.'
    });
  }
};

/**
 * 근무자 퇴사 처리
 * 
 * 비즈니스 로직:
 * - 실제 삭제가 아닌 status를 'resigned'로 변경
 * - 퇴사일(resignedDate)을 현재 날짜로 기록
 * - 기존 작업일지는 그대로 유지 (참조 무결성 보존)
 * - 퇴사 후에도 작업일지에서 "근무자명 (퇴사)" 형태로 표시 가능
 * 
 * @param {Object} req.params.id - 근무자 ID
 * @param {Object} req.user - JWT에서 추출한 작업반장 정보
 * @returns {Object} 퇴사 처리 결과
 */
exports.resignWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const foremanId = req.user.id;

    // 근무자 조회
    const worker = await Worker.findByPk(id);
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: '근무자를 찾을 수 없습니다.'
      });
    }

    // 권한 확인: 본인이 등록한 근무자만 퇴사 처리 가능
    if (worker.foremanId !== foremanId) {
      return res.status(403).json({
        success: false,
        message: '해당 근무자를 퇴사 처리할 권한이 없습니다.'
      });
    }

    // 이미 퇴사한 근무자인지 확인
    if (worker.status === 'resigned') {
      return res.status(400).json({
        success: false,
        message: '이미 퇴사 처리된 근무자입니다.'
      });
    }

    // 퇴사 처리: status를 'resigned'로 변경, 퇴사일 기록
    await worker.update({
      status: 'resigned',
      resignedDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD 형식
    });

    res.status(200).json({
      success: true,
      message: '근무자가 퇴사 처리되었습니다.',
      data: {
        id: worker.id,
        name: worker.name,
        status: worker.status,
        resignedDate: worker.resignedDate
      }
    });
  } catch (error) {
    console.error('Resign worker error:', error);
    res.status(500).json({
      success: false,
      message: '근무자 퇴사 처리에 실패했습니다.',
      error: error.message
    });
  }
};

/**
 * 근무자 삭제 (레거시, resignWorker 사용 권장)
 * @deprecated 퇴사 처리(resignWorker)를 사용하세요
 */
exports.deleteWorker = exports.resignWorker;

/**
 * 현장별 작업 목록 조회
 */
exports.getTasksBySite = async (req, res) => {
  try {
    const { siteId } = req.query;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: '현장 ID가 필요합니다.'
      });
    }

    const tasks = await Task.findAll({
      where: { siteId },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'role']
        },
        {
          model: User,
          as: 'assignee',
          attributes: ['id', 'email', 'role']
        },
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name', 'address']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: '작업 목록 조회에 실패했습니다.'
    });
  }
};

/**
 * 작업일지 등록
 */
exports.createWorkLog = async (req, res) => {
  try {
    const { workerId, description, effort, workDate, siteId } = req.body;
    const creatorId = req.user.id;
    const companyId = req.user.companyId;

    // 필수 필드 검증
    if (!workerId || !description || !effort || !workDate || !siteId) {
      return res.status(400).json({
        success: false,
        message: '모든 필수 항목을 입력해주세요.'
      });
    }

    // 근무자 존재 여부 및 기업 소속 확인
    const worker = await Worker.findOne({ where: { id: workerId, companyId } });
    if (!worker) {
      return res.status(404).json({
        success: false,
        message: '근무자를 찾을 수 없습니다.'
      });
    }

    // 작업일지 생성 (현재 시점의 단가를 스냅샷으로 저장)
    const workLog = await Task.create({
      workerId,
      description,
      effort: parseFloat(effort),
      dailyRate: worker.dailyRate,  // ← 중요! 작업일지 생성 당시의 단가 저장
      workDate,
      siteId,
      creatorId,
      companyId,  // 기업 ID 추가
      status: '완료',
      title: `${worker.name} - ${workDate} 작업일지`
    });

    // 생성된 작업일지 정보와 관련 데이터 조회
    const workLogWithDetails = await Task.findByPk(workLog.id, {
      include: [
        {
          model: Worker,
          as: 'worker',
          attributes: ['id', 'name', 'phoneNumber', 'dailyRate']
        },
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name', 'address']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'phone', 'role']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: '작업일지가 등록되었습니다.',
      data: workLogWithDetails
    });
  } catch (error) {
    console.error('Create work log error:', error);
    res.status(500).json({
      success: false,
      message: '작업일지 등록에 실패했습니다.',
      error: error.message
    });
  }
};

/**
 * 작업일지 목록 조회
 */
exports.getWorkLogs = async (req, res) => {
  try {
    const { siteId, workDate } = req.query;
    const companyId = req.user.companyId;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: '현장 ID가 필요합니다.'
      });
    }

    const whereClause = { siteId, companyId };
    if (workDate) {
      whereClause.workDate = workDate;
    }

    const workLogs = await Task.findAll({
      where: whereClause,
      attributes: ['id', 'workDate', 'description', 'effort', 'dailyRate', 'createdAt', 'updatedAt'],
      include: [
        {
          model: Worker,
          as: 'worker',
          // 퇴사 여부 확인을 위해 status, resignedDate 포함
          attributes: ['id', 'name', 'phoneNumber', 'dailyRate', 'status', 'resignedDate']
        },
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name', 'address']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'phone', 'role']
        }
      ],
      order: [['workDate', 'DESC'], ['createdAt', 'DESC']]
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
 * 근무자 목록 조회 (간단한 버전 - 작업일지 등록용)
 */
exports.getWorkersList = async (req, res) => {
  try {
    const foremanId = req.user.id;

    const workers = await Worker.findAll({
      where: { foremanId, status: 'active' },
      attributes: ['id', 'name', 'phoneNumber', 'dailyRate'],
      order: [['name', 'ASC']]
    });

    res.status(200).json({
      success: true,
      data: workers
    });
  } catch (error) {
    console.error('Get workers list error:', error);
    res.status(500).json({
      success: false,
      message: '근무자 목록 조회에 실패했습니다.'
    });
  }
};

/**
 * 작업일지 수정
 */
exports.updateWorkLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, effort, workDate } = req.body;
    const companyId = req.user.companyId;

    // 작업일지 조회 및 권한 확인
    const workLog = await Task.findOne({ 
      where: { id, companyId } 
    });

    if (!workLog) {
      return res.status(404).json({
        success: false,
        message: '작업일지를 찾을 수 없습니다.'
      });
    }

    // 지급완료된 작업일지는 수정 불가 (이중 지급 방지)
    if (workLog.paymentStatus === '지급완료' || workLog.paymentDate) {
      return res.status(403).json({
        success: false,
        message: '이미 지급완료된 작업일지는 수정할 수 없습니다. 이중 지급을 방지하기 위해 관리자에게 문의하세요.'
      });
    }

    // 수정
    await workLog.update({
      description: description || workLog.description,
      effort: effort ? parseFloat(effort) : workLog.effort,
      workDate: workDate || workLog.workDate
    });

    // 수정된 작업일지 정보와 관련 데이터 조회
    const updatedWorkLog = await Task.findByPk(id, {
      include: [
        {
          model: Worker,
          as: 'worker',
          attributes: ['id', 'name', 'phoneNumber', 'dailyRate']
        },
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name', 'address']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'phone', 'role']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: '작업일지가 수정되었습니다.',
      data: updatedWorkLog
    });
  } catch (error) {
    console.error('Update work log error:', error);
    res.status(500).json({
      success: false,
      message: '작업일지 수정에 실패했습니다.',
      error: error.message
    });
  }
};

/**
 * 작업일지 삭제
 */
exports.deleteWorkLog = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // 작업일지 조회 및 권한 확인
    const workLog = await Task.findOne({ 
      where: { id, companyId } 
    });

    if (!workLog) {
      return res.status(404).json({
        success: false,
        message: '작업일지를 찾을 수 없습니다.'
      });
    }

    // 지급완료된 작업일지는 삭제 불가 (이중 지급 방지)
    if (workLog.paymentStatus === '지급완료' || workLog.paymentDate) {
      return res.status(403).json({
        success: false,
        message: '이미 지급완료된 작업일지는 삭제할 수 없습니다. 이중 지급을 방지하기 위해 관리자에게 문의하세요.'
      });
    }

    // 삭제
    await workLog.destroy();

    res.status(200).json({
      success: true,
      message: '작업일지가 삭제되었습니다.'
    });
  } catch (error) {
    console.error('Delete work log error:', error);
    res.status(500).json({
      success: false,
      message: '작업일지 삭제에 실패했습니다.',
      error: error.message
    });
  }
};

/**
 * 지출결의 등록
 */
exports.createExpense = async (req, res) => {
  try {
    const { title, content, amount, expenseDate, siteId } = req.body;
    const creatorId = req.user.id;
    const companyId = req.user.companyId;

    // 필수 필드 검증
    if (!title || !content || !amount || !expenseDate || !siteId) {
      return res.status(400).json({
        success: false,
        message: '모든 필수 항목을 입력해주세요.'
      });
    }

    // 금액 검증
    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: '금액은 0보다 커야 합니다.'
      });
    }

    // 현장 존재 여부 확인
    const site = await Site.findOne({ where: { id: siteId, companyId } });
    if (!site) {
      return res.status(404).json({
        success: false,
        message: '현장을 찾을 수 없습니다.'
      });
    }

    // 지출결의 생성
    const expense = await Expense.create({
      title,
      content,
      amount: parseInt(amount),
      expenseDate,
      siteId,
      creatorId,
      companyId,
      status: 'pending'
    });

    // 생성된 지출결의 정보와 관련 데이터 조회
    const expenseWithDetails = await Expense.findByPk(expense.id, {
      include: [
        {
          model: Site,
          as: 'site',
          attributes: ['id', 'name', 'address']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'email', 'phone', 'role']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: '지출결의가 등록되었습니다.',
      data: expenseWithDetails
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: '지출결의 등록에 실패했습니다.',
      error: error.message
    });
  }
};

/**
 * 지출결의 목록 조회 (작업반장용)
 */
exports.getExpenses = async (req, res) => {
  try {
    const { siteId, status } = req.query;
    const companyId = req.user.companyId;
    const creatorId = req.user.id; // 작업반장은 본인이 작성한 것만 조회

    const whereClause = { companyId, creatorId };
    if (siteId) {
      whereClause.siteId = siteId;
    }
    if (status) {
      whereClause.status = status;
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
          attributes: ['id', 'email', 'phone', 'role']
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
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: '지출결의 목록 조회에 실패했습니다.'
    });
  }
};

