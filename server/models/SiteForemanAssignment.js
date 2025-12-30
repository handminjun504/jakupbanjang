const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SiteForemanAssignment = sequelize.define('SiteForemanAssignment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  siteId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'site_id',
    references: {
      model: 'sites',
      key: 'id'
    },
    comment: '현장 ID'
  },
  foremanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'foreman_id',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '작업반장 ID'
  },
  assignedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'assigned_at',
    comment: '할당 일시'
  },
  assignedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'assigned_by',
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '할당한 관리자 ID'
  }
}, {
  tableName: 'site_foreman_assignments',
  timestamps: false,
  underscored: true,
  comment: '현장-작업반장 할당 테이블',
  indexes: [
    {
      name: 'idx_site_foreman_site',
      fields: ['site_id']
    },
    {
      name: 'idx_site_foreman_foreman',
      fields: ['foreman_id']
    },
    {
      name: 'unique_site_foreman',
      unique: true,
      fields: ['site_id', 'foreman_id']
    }
  ]
});

module.exports = SiteForemanAssignment;

