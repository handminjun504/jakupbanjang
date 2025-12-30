const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Worker = sequelize.define('Worker', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '근무자 이름'
  },
  rrn: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '주민등록번호 (AES-256 암호화, 복호화 가능)'
  },
  rrnHash: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '주민등록번호 해시 (중복 체크용 SHA256)'
  },
  rrnDisplay: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '주민등록번호 표시용 (마스킹: 123456-1******)'
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '연락처'
  },
  dailyRate: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '단가'
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '비고'
  },
  foremanId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    comment: '등록한 작업반장 ID'
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'companies',
      key: 'id'
    },
    comment: '소속 기업 ID'
  },
  status: {
    type: DataTypes.ENUM('active', 'resigned'),
    defaultValue: 'active',
    comment: '근무 상태 (active: 재직, resigned: 퇴사)'
  },
  resignedDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    comment: '퇴사일 (퇴사 처리 시 자동 기록)'
  }
}, {
  tableName: 'workers',
  timestamps: true,
  underscored: true,  // 자동으로 snake_case 사용
  comment: '근무자 정보 테이블 (작업반장별 통합 관리)',
  indexes: [
    // 작업반장별 주민번호 중복 방지 (복합 유니크 인덱스)
    {
      name: 'idx_workers_foreman_rrn_hash',
      unique: true,
      fields: ['foremanId', 'rrnHash']
    },
    // 작업반장별 근무자 조회
    {
      name: 'idx_workers_foreman',
      fields: ['foremanId']
    },
    // 기업별 근무자 조회
    {
      name: 'idx_workers_company',
      fields: ['companyId']
    },
    // 상태별 근무자 조회
    {
      name: 'idx_workers_status',
      fields: ['status']
    },
    // 작업반장별 활성 근무자 조회 (가장 빈번한 쿼리)
    {
      name: 'idx_workers_foreman_status',
      fields: ['foremanId', 'status']
    }
  ]
});

module.exports = Worker;

