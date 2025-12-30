const User = require('../models/User');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Attachment = require('../models/Attachment');
const Site = require('../models/Site');
const Worker = require('../models/Worker');
const Company = require('../models/Company');
const Expense = require('../models/Expense');
const SiteForemanAssignment = require('../models/SiteForemanAssignment');

// 모델 간 관계 설정
const setupAssociations = () => {
  // Company와 User 관계
  Company.hasMany(User, {
    foreignKey: 'companyId',
    as: 'users'
  });

  User.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
  });

  // Company와 모든 데이터 모델 관계
  Company.hasMany(Site, {
    foreignKey: 'companyId',
    as: 'sites'
  });

  Site.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
  });

  Company.hasMany(Worker, {
    foreignKey: 'companyId',
    as: 'workers'
  });

  Worker.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
  });

  Company.hasMany(Task, {
    foreignKey: 'companyId',
    as: 'tasks'
  });

  Task.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
  });

  // User와 Site 관계
  User.hasMany(Site, {
    foreignKey: 'managerId',
    as: 'managedSites'
  });

  Site.belongsTo(User, {
    foreignKey: 'managerId',
    as: 'manager'
  });

  // Site와 Task 관계 (작업은 특정 현장에 속함)
  Site.hasMany(Task, {
    foreignKey: 'siteId',
    as: 'tasks'
  });

  Task.belongsTo(Site, {
    foreignKey: 'siteId',
    as: 'site'
  });
  // User와 Task 관계
  User.hasMany(Task, {
    foreignKey: 'creatorId',
    as: 'createdTasks'
  });

  User.hasMany(Task, {
    foreignKey: 'assigneeId',
    as: 'assignedTasks'
  });

  Task.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator'
  });

  Task.belongsTo(User, {
    foreignKey: 'assigneeId',
    as: 'assignee'
  });

  // Task와 Comment 관계
  Task.hasMany(Comment, {
    foreignKey: 'TaskId',
    as: 'comments',
    onDelete: 'CASCADE'
  });

  Comment.belongsTo(Task, {
    foreignKey: 'TaskId'
  });

  Comment.belongsTo(User, {
    foreignKey: 'UserId'
  });

  User.hasMany(Comment, {
    foreignKey: 'UserId'
  });

  // Task와 Attachment 관계
  Task.hasMany(Attachment, {
    foreignKey: 'task_id',
    as: 'attachments',
    onDelete: 'CASCADE'
  });

  Attachment.belongsTo(Task, {
    foreignKey: 'task_id',
    as: 'task'
  });

  Attachment.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'uploader'
  });

  User.hasMany(Attachment, {
    foreignKey: 'UserId'
  });

  // Worker 관계 (작업반장이 근무자를 관리)
  User.hasMany(Worker, {
    foreignKey: 'foremanId',
    as: 'managedWorkers'
  });

  Worker.belongsTo(User, {
    foreignKey: 'foremanId',
    as: 'foreman'
  });

  // Task와 Worker 관계 (작업일지용)
  Worker.hasMany(Task, {
    foreignKey: 'workerId',
    as: 'workLogs'
  });

  Task.belongsTo(Worker, {
    foreignKey: 'workerId',
    as: 'worker'
  });

  // Expense 관계
  Company.hasMany(Expense, {
    foreignKey: 'companyId',
    as: 'expenses'
  });

  Expense.belongsTo(Company, {
    foreignKey: 'companyId',
    as: 'company'
  });

  Site.hasMany(Expense, {
    foreignKey: 'siteId',
    as: 'expenses'
  });

  Expense.belongsTo(Site, {
    foreignKey: 'siteId',
    as: 'site'
  });

  User.hasMany(Expense, {
    foreignKey: 'creatorId',
    as: 'createdExpenses'
  });

  Expense.belongsTo(User, {
    foreignKey: 'creatorId',
    as: 'creator'
  });

  User.hasMany(Expense, {
    foreignKey: 'approverId',
    as: 'approvedExpenses'
  });

  Expense.belongsTo(User, {
    foreignKey: 'approverId',
    as: 'approver'
  });

  // Site와 Foreman Many-to-Many 관계 (할당)
  Site.belongsToMany(User, {
    through: SiteForemanAssignment,
    foreignKey: 'siteId',
    otherKey: 'foremanId',
    as: 'assignedForemen'
  });

  User.belongsToMany(Site, {
    through: SiteForemanAssignment,
    foreignKey: 'foremanId',
    otherKey: 'siteId',
    as: 'assignedSites'
  });

  // SiteForemanAssignment 직접 관계
  SiteForemanAssignment.belongsTo(Site, {
    foreignKey: 'siteId',
    as: 'site'
  });

  SiteForemanAssignment.belongsTo(User, {
    foreignKey: 'foremanId',
    as: 'foreman'
  });

  SiteForemanAssignment.belongsTo(User, {
    foreignKey: 'assignedBy',
    as: 'assigner'
  });
};

module.exports = setupAssociations;

