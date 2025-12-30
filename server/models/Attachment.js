const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attachment = sequelize.define('Attachment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '원본 파일명'
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: 'Supabase Storage Public URL'
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '파일 크기 (bytes)'
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: 'MIME 타입'
  },
  storage_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: 'Supabase Storage 내부 경로'
  },
  task_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id'
    },
    comment: '작업 ID'
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '업로드한 사용자 ID'
  }
}, {
  tableName: 'attachments',
  timestamps: true,
  underscored: true,
  indexes: [
    // 작업별 첨부파일 조회
    {
      name: 'idx_attachments_task',
      fields: ['task_id']
    },
    // 사용자별 첨부파일 조회
    {
      name: 'idx_attachments_user',
      fields: ['user_id']
    }
  ]
});

module.exports = Attachment;

