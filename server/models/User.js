const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '이름 (작업반장 필수, 관리자 선택)'
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,  // 작업반장은 이메일 없이 휴대폰으로 가입
    validate: {
      isEmail: true
    },
    comment: '이메일 (관리자 필수, 작업반장 선택)'
  },
  phone: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true,  // 관리자는 휴대폰 없이 이메일로 가입
    comment: '휴대폰 번호 (작업반장 필수, 관리자 선택)'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dailyRate: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'daily_rate',  // 명시적으로 DB 컬럼명 지정
    comment: '작업반장 단가 (관리자가 설정)'
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'foreman',
    validate: {
      isIn: [['manager', 'foreman']]
    }
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'company_id',  // 명시적으로 DB 컬럼명 지정
    references: {
      model: 'companies',
      key: 'id'
    },
    comment: '소속 기업 ID'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,  // 자동으로 snake_case 사용
  indexes: [
    // 이메일 인덱스 (로그인 시 빠른 검색)
    {
      name: 'idx_users_email',
      unique: true,
      fields: ['email']
    },
    // 휴대폰 인덱스 (작업반장 로그인)
    {
      name: 'idx_users_phone',
      unique: true,
      fields: ['phone']
    },
    // 기업별 사용자 조회
    {
      name: 'idx_users_company',
      fields: ['companyId']
    },
    // 역할별 사용자 조회
    {
      name: 'idx_users_role',
      fields: ['role']
    },
    // 기업별 역할 복합 인덱스 (관리자가 같은 기업의 작업반장 조회 시)
    {
      name: 'idx_users_company_role',
      fields: ['companyId', 'role']
    }
  ]
});

module.exports = User;

