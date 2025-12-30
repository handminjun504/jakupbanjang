const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '지출 제목'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '지출 내용'
  },
  amount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '지출 금액'
  },
  expenseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '지출 일자',
    field: 'expense_date'  // snake_case 매핑
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'approved', 'rejected']]
    },
    comment: '승인 상태: pending(대기중), approved(승인), rejected(거절)'
  },
  siteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'sites',
      key: 'id'
    },
    comment: '현장 ID',
    field: 'site_id'  // snake_case 매핑
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '작성자 ID (작업반장)',
    field: 'creator_id'  // snake_case 매핑
  },
  approverId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '승인/거절한 관리자 ID',
    field: 'approver_id'  // snake_case 매핑
  },
  approvalDate: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '승인/거절 일시',
    field: 'approval_date'  // snake_case 매핑
  },
  rejectReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '거절 사유',
    field: 'reject_reason'  // snake_case 매핑
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    },
    comment: '소속 기업 ID',
    field: 'company_id'  // snake_case 매핑
  }
}, {
  tableName: 'expenses',
  timestamps: true,
  underscored: true,  // 자동으로 snake_case 사용
  indexes: [
    {
      name: 'idx_expenses_site',
      fields: ['site_id']  // snake_case
    },
    {
      name: 'idx_expenses_creator',
      fields: ['creator_id']  // snake_case
    },
    {
      name: 'idx_expenses_status',
      fields: ['status']
    },
    {
      name: 'idx_expenses_company',
      fields: ['company_id']  // snake_case
    },
    {
      name: 'idx_expenses_date',
      fields: ['expense_date']  // snake_case
    },
    {
      name: 'idx_expenses_company_status',
      fields: ['company_id', 'status']  // snake_case
    }
  ]
});

module.exports = Expense;

