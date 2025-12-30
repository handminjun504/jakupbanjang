const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Site = sequelize.define('Site', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '현장명',
  },
  address: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '현장 주소',
  },
  managerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '담당 관리자 ID',
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'suspended'),
    defaultValue: 'active',
    comment: '현장 상태',
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '시작일',
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '종료일',
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    },
    comment: '소속 기업 ID',
  },
}, {
  tableName: 'sites',
  timestamps: true,
  underscored: true,  // 자동으로 snake_case 사용
  comment: '현장 정보 테이블',
  indexes: [
    // 관리자별 현장 조회
    {
      name: 'idx_sites_manager',
      fields: ['managerId']
    },
    // 기업별 현장 조회
    {
      name: 'idx_sites_company',
      fields: ['companyId']
    },
    // 상태별 현장 조회
    {
      name: 'idx_sites_status',
      fields: ['status']
    },
    // 기업별 활성 현장 조회 (빈번한 쿼리)
    {
      name: 'idx_sites_company_status',
      fields: ['companyId', 'status']
    },
    // 현장명 검색
    {
      name: 'idx_sites_name',
      fields: ['name']
    }
  ]
});

module.exports = Site;

