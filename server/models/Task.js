const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '요청',
    validate: {
      isIn: [['요청', '진행중', '완료']]
    }
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  assigneeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  siteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'sites',
      key: 'id'
    },
    comment: '현장 ID'
  },
  workerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'workers',
      key: 'id'
    },
    comment: '근무자 ID (작업일지용)'
  },
  effort: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: '공수 (소수점 포함, 예: 0.5, 1.5)'
  },
  dailyRate: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '작업일지 생성 당시의 일당 (스냅샷) - 과거 기록 보호'
  },
  workDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '작업일'
  },
  paymentStatus: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '미지급',
    validate: {
      isIn: [['미지급', '지급완료']]
    },
    comment: '지급 상태 (미지급, 지급완료)'
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '지급일자'
  },
  paymentBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '지급 처리한 관리자 ID'
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    },
    comment: '소속 기업 ID'
  }
}, {
  tableName: 'tasks',
  timestamps: true,
  underscored: true,  // 자동으로 snake_case 사용
  indexes: [
    // 현장별 작업일지 조회
    {
      name: 'idx_tasks_site',
      fields: ['siteId']
    },
    // 작성자별 작업일지 조회
    {
      name: 'idx_tasks_creator',
      fields: ['creatorId']
    },
    // 담당자별 작업 조회
    {
      name: 'idx_tasks_assignee',
      fields: ['assigneeId']
    },
    // 근무자별 작업일지 조회
    {
      name: 'idx_tasks_worker',
      fields: ['workerId']
    },
    // 기업별 작업일지 조회
    {
      name: 'idx_tasks_company',
      fields: ['companyId']
    },
    // 작업일 조회 (날짜별 필터링)
    {
      name: 'idx_tasks_work_date',
      fields: ['workDate']
    },
    // 상태별 작업 조회
    {
      name: 'idx_tasks_status',
      fields: ['status']
    },
    // 현장별 작업일 복합 인덱스 (가장 빈번한 쿼리)
    {
      name: 'idx_tasks_site_date',
      fields: ['siteId', 'workDate']
    },
    // 기업별 현장별 작업일지 조회
    {
      name: 'idx_tasks_company_site',
      fields: ['companyId', 'siteId']
    },
    // 기업별 작업일 조회
    {
      name: 'idx_tasks_company_date',
      fields: ['companyId', 'workDate']
    }
  ]
});

module.exports = Task;

