// 테스트 환경 변수 설정
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters';
process.env.SKIP_RRN_VALIDATION = 'true';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.diqflvxzsjvndlbwzldi:9hDhHMfxFe2Z8rFH@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require';

const sequelize = require('../config/database');
const User = require('../models/User');
const Company = require('../models/Company');
const Site = require('../models/Site');
const Worker = require('../models/Worker');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { encryptRRN } = require('../utils/encryption');

// JWT 시크릿 (테스트용)
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-testing-only';

// 테스트 데이터 저장소
let testData = {
  companies: {},
  managers: {},
  foremen: {},
  sites: {},
  workers: {},
  worklogs: {}
};

/**
 * JWT 토큰 생성 헬퍼
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      phone: user.phone,
      role: user.role,
      companyId: user.companyId
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * 테스트 DB 초기화 및 시드 데이터 생성
 */
async function setupTestData() {
  try {
    // 기존 데이터 삭제 (역순으로)
    await Task.destroy({ where: {}, force: true });
    await Worker.destroy({ where: {}, force: true });
    await Site.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Company.destroy({ where: {}, force: true });

    console.log('✅ 기존 테스트 데이터 삭제 완료');

    // 회사 A 생성
    const companyA = await Company.create({
      name: '건설회사 A',
      inviteCode: 'TESTA123'
    });
    testData.companies.A = companyA;

    // 회사 B 생성
    const companyB = await Company.create({
      name: '건설회사 B',
      inviteCode: 'TESTB456'
    });
    testData.companies.B = companyB;

    console.log('✅ 회사 2개 생성 완료');

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash('Test1234!', 10);

    // 관리자 A (회사 A)
    const managerA = await User.create({
      email: 'manager-a@test.com',
      password: hashedPassword,
      role: 'manager',
      companyId: companyA.id,
      name: '관리자 A'
    });
    testData.managers.A = managerA;

    // 관리자 B (회사 B)
    const managerB = await User.create({
      email: 'manager-b@test.com',
      password: hashedPassword,
      role: 'manager',
      companyId: companyB.id,
      name: '관리자 B'
    });
    testData.managers.B = managerB;

    // 작업반장 A1 (회사 A)
    const foremanA1 = await User.create({
      phone: '010-1111-1111',
      password: hashedPassword,
      role: 'foreman',
      companyId: companyA.id,
      name: '작업반장 A1'
    });
    testData.foremen.A1 = foremanA1;

    // 작업반장 A2 (회사 A)
    const foremanA2 = await User.create({
      phone: '010-1111-2222',
      password: hashedPassword,
      role: 'foreman',
      companyId: companyA.id,
      name: '작업반장 A2'
    });
    testData.foremen.A2 = foremanA2;

    // 작업반장 B1 (회사 B)
    const foremanB1 = await User.create({
      phone: '010-2222-1111',
      password: hashedPassword,
      role: 'foreman',
      companyId: companyB.id,
      name: '작업반장 B1'
    });
    testData.foremen.B1 = foremanB1;

    // 작업반장 B2 (회사 B)
    const foremanB2 = await User.create({
      phone: '010-2222-2222',
      password: hashedPassword,
      role: 'foreman',
      companyId: companyB.id,
      name: '작업반장 B2'
    });
    testData.foremen.B2 = foremanB2;

    console.log('✅ 사용자 6명 생성 완료 (관리자 2명, 작업반장 4명)');

    // 현장 A (회사 A)
    const siteA = await Site.create({
      name: '서울 현장 A',
      address: '서울시 강남구',
      managerId: managerA.id,
      companyId: companyA.id,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'active'
    });
    testData.sites.A = siteA;

    // 현장 B (회사 B)
    const siteB = await Site.create({
      name: '부산 현장 B',
      address: '부산시 해운대구',
      managerId: managerB.id,
      companyId: companyB.id,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'active'
    });
    testData.sites.B = siteB;

    console.log('✅ 현장 2개 생성 완료');

    // 근무자 A1-W1 (작업반장 A1, 회사 A)
    const crypto = require('crypto');
    const rrnA1 = '9001011234567';
    const encryptedRRN_A1 = encryptRRN(rrnA1);
    const rrnHash_A1 = crypto.createHash('sha256').update(rrnA1).digest('hex');
    
    const workerA1 = await Worker.create({
      name: '근무자 A1-W1',
      rrn: encryptedRRN_A1,
      rrnHash: rrnHash_A1,
      rrnDisplay: '900101-1******',
      phoneNumber: '010-3333-1111',
      dailyRate: 150000,
      foremanId: foremanA1.id,
      companyId: companyA.id,
      status: 'active'
    });
    testData.workers.A1 = workerA1;

    // 근무자 B1-W1 (작업반장 B1, 회사 B)
    const rrnB1 = '9002021234567';
    const encryptedRRN_B1 = encryptRRN(rrnB1);
    const rrnHash_B1 = crypto.createHash('sha256').update(rrnB1).digest('hex');
    
    const workerB1 = await Worker.create({
      name: '근무자 B1-W1',
      rrn: encryptedRRN_B1,
      rrnHash: rrnHash_B1,
      rrnDisplay: '900202-1******',
      phoneNumber: '010-4444-1111',
      dailyRate: 150000,
      foremanId: foremanB1.id,
      companyId: companyB.id,
      status: 'active'
    });
    testData.workers.B1 = workerB1;

    console.log('✅ 근무자 2명 생성 완료');

    // 작업일지 A1 (작업반장 A1, 회사 A)
    const worklogA1 = await Task.create({
      workerId: workerA1.id,
      description: '철근 작업',
      effort: 1.0,
      dailyRate: 150000,
      workDate: '2025-01-07',
      siteId: siteA.id,
      creatorId: foremanA1.id,
      companyId: companyA.id,
      status: '완료',
      title: '근무자 A1-W1 - 2025-01-07 작업일지',
      paymentStatus: '미지급'
    });
    testData.worklogs.A1 = worklogA1;

    // 작업일지 B1 (작업반장 B1, 회사 B)
    const worklogB1 = await Task.create({
      workerId: workerB1.id,
      description: '배관 작업',
      effort: 1.0,
      dailyRate: 150000,
      workDate: '2025-01-07',
      siteId: siteB.id,
      creatorId: foremanB1.id,
      companyId: companyB.id,
      status: '완료',
      title: '근무자 B1-W1 - 2025-01-07 작업일지',
      paymentStatus: '미지급'
    });
    testData.worklogs.B1 = worklogB1;

    console.log('✅ 작업일지 2개 생성 완료');
    console.log('✅ 테스트 데이터 초기화 완료!');
    console.log('');
    console.log('📊 생성된 테스트 데이터:');
    console.log(`   회사 A (ID: ${companyA.id}): ${companyA.name}`);
    console.log(`   회사 B (ID: ${companyB.id}): ${companyB.name}`);
    console.log(`   관리자 A (ID: ${managerA.id}): ${managerA.email}`);
    console.log(`   관리자 B (ID: ${managerB.id}): ${managerB.email}`);
    console.log(`   작업반장 A1 (ID: ${foremanA1.id}): ${foremanA1.phone}`);
    console.log(`   작업반장 B1 (ID: ${foremanB1.id}): ${foremanB1.phone}`);
    console.log(`   현장 A (ID: ${siteA.id}): ${siteA.name}`);
    console.log(`   현장 B (ID: ${siteB.id}): ${siteB.name}`);
    console.log('');

    return testData;
  } catch (error) {
    console.error('❌ 테스트 데이터 초기화 실패:', error);
    throw error;
  }
}

/**
 * 테스트 후 정리
 */
async function cleanupTestData() {
  try {
    await Task.destroy({ where: {}, force: true });
    await Worker.destroy({ where: {}, force: true });
    await Site.destroy({ where: {}, force: true });
    await User.destroy({ where: {}, force: true });
    await Company.destroy({ where: {}, force: true });
    console.log('✅ 테스트 데이터 정리 완료');
  } catch (error) {
    console.error('❌ 테스트 데이터 정리 실패:', error);
  }
}

module.exports = {
  setupTestData,
  cleanupTestData,
  generateToken,
  testData
};

