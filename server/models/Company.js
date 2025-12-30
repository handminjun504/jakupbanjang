const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { customAlphabet } = require('nanoid');

// 초대 코드 생성 함수 (예: A-CORP-123)
const generateInviteCode = () => {
  const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
  const code = nanoid();
  return `${code.slice(0, 4)}-${code.slice(4, 8)}`;
};

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '기업명'
  },
  inviteCode: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    comment: '초대 코드 (예: ABCD-1234)'
  }
}, {
  tableName: 'companies',
  timestamps: true,
  underscored: true,  // 자동으로 snake_case 사용
  comment: '기업 정보 테이블',
  hooks: {
    beforeValidate: (company) => {
      // inviteCode가 없으면 자동 생성
      if (!company.inviteCode) {
        company.inviteCode = generateInviteCode();
      }
    }
  },
  indexes: [
    // 초대 코드 인덱스 (가입 시 빠른 검색)
    {
      name: 'idx_companies_invite_code',
      unique: true,
      fields: ['inviteCode']
    },
    // 기업명 검색
    {
      name: 'idx_companies_name',
      fields: ['name']
    }
  ]
});

// 초대 코드 생성 헬퍼 메서드
Company.generateInviteCode = generateInviteCode;

module.exports = Company;

