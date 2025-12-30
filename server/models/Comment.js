const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  TaskId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'tasks',
      key: 'id'
    }
  },
  UserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'comments',
  timestamps: true,
  underscored: true,  // 자동으로 snake_case 사용
  indexes: [
    // 작업별 댓글 조회
    {
      name: 'idx_comments_task',
      fields: ['TaskId']
    },
    // 사용자별 댓글 조회
    {
      name: 'idx_comments_user',
      fields: ['UserId']
    },
    // 작업별 최신 댓글 조회
    {
      name: 'idx_comments_task_created',
      fields: ['TaskId', 'createdAt']
    }
  ]
});

module.exports = Comment;

