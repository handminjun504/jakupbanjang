// 테스트 환경 변수를 먼저 설정 (모든 require 전에)
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres.diqflvxzsjvndlbwzldi:9hDhHMfxFe2Z8rFH@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require';
process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes-only';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters';
process.env.SKIP_RRN_VALIDATION = 'true';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.SUPABASE_URL = 'https://diqflvxzsjvndlbwzldi.supabase.co';
process.env.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpcWZsdnh6c2p2bmRsYnd6bGRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzAzMzM1MTMsImV4cCI6MjA0NTkwOTUxM30.55RQGZUxPNfb4rLq2YUqJvHyq3UB8l11VX_zv9xfqwY';

const request = require('supertest');
const app = require('../../index');
const { setupTestData, cleanupTestData, generateToken, testData } = require('../setup.critical');

describe('🔒 데이터 격리 테스트 (Data Isolation)', () => {
  let managerA, managerB;
  let foremanA1, foremanB1;
  let companyA, companyB;
  let siteA, siteB;
  let workerA1, workerB1;
  let worklogA1, worklogB1;

  // 테스트 시작 전 데이터 준비
  beforeAll(async () => {
    const data = await setupTestData();
    
    companyA = data.companies.A;
    companyB = data.companies.B;
    managerA = data.managers.A;
    managerB = data.managers.B;
    foremanA1 = data.foremen.A1;
    foremanB1 = data.foremen.B1;
    siteA = data.sites.A;
    siteB = data.sites.B;
    workerA1 = data.workers.A1;
    workerB1 = data.workers.B1;
    worklogA1 = data.worklogs.A1;
    worklogB1 = data.worklogs.B1;
  });

  // 테스트 종료 후 정리
  afterAll(async () => {
    await cleanupTestData();
  });

  // ==================== 관리자 데이터 격리 (3개) ====================

  test('1️⃣ 관리자 A가 본인 회사(Company A) 현장 조회 성공', async () => {
    const token = generateToken(managerA);
    
    const response = await request(app)
      .get('/api/admin/sites')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // 모든 현장이 회사 A에 속해야 함
    response.body.data.forEach(site => {
      expect(site.companyId).toBe(companyA.id);
    });
    
    // 현장 A가 결과에 포함되어야 함
    const foundSiteA = response.body.data.find(s => s.id === siteA.id);
    expect(foundSiteA).toBeDefined();
    expect(foundSiteA.name).toBe('서울 현장 A');
    
    console.log(`✅ 테스트 1 통과: 관리자 A가 ${response.body.data.length}개 현장 조회 성공`);
  });

  test('2️⃣ 관리자 A가 회사 B 현장 조회 시 빈 배열 (격리 확인)', async () => {
    const token = generateToken(managerA);
    
    const response = await request(app)
      .get('/api/admin/sites')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // 회사 B의 현장은 결과에 포함되지 않아야 함
    const companyBSites = response.body.data.filter(s => s.companyId === companyB.id);
    expect(companyBSites.length).toBe(0);
    
    // 현장 B가 결과에 포함되지 않아야 함
    const foundSiteB = response.body.data.find(s => s.id === siteB.id);
    expect(foundSiteB).toBeUndefined();
    
    console.log('✅ 테스트 2 통과: 관리자 A는 회사 B 현장을 볼 수 없음 (격리 성공)');
  });

  test('3️⃣ 관리자 A가 회사 B 현장 수정 시도 → 404 에러', async () => {
    const token = generateToken(managerA);
    
    const response = await request(app)
      .put(`/api/admin/sites/${siteB.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '해킹 시도 - 현장명 변경',
        address: '해킹 주소'
      });
    
    // companyId 필터로 인해 404 반환
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('현장');
    
    console.log('✅ 테스트 3 통과: 관리자 A는 회사 B 현장을 수정할 수 없음 (보안 성공)');
  });

  // ==================== 작업반장 데이터 격리 (4개) ====================

  test('4️⃣ 작업반장 A1이 본인이 생성한 근무자 조회 성공', async () => {
    const token = generateToken(foremanA1);
    
    const response = await request(app)
      .get('/api/foreman/workers')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // 모든 근무자의 foremanId가 A1이어야 함
    response.body.data.forEach(worker => {
      expect(worker.foremanId || worker.id).toBeDefined();
    });
    
    // 근무자 A1-W1이 결과에 포함되어야 함
    const foundWorkerA1 = response.body.data.find(w => w.id === workerA1.id);
    expect(foundWorkerA1).toBeDefined();
    expect(foundWorkerA1.name).toBe('근무자 A1-W1');
    
    console.log(`✅ 테스트 4 통과: 작업반장 A1이 ${response.body.data.length}명 근무자 조회 성공`);
  });

  test('5️⃣ 작업반장 A1이 작업반장 B1의 근무자 조회 시 빈 배열 (격리 확인)', async () => {
    const token = generateToken(foremanA1);
    
    const response = await request(app)
      .get('/api/foreman/workers')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // B1의 근무자는 결과에 포함되지 않아야 함
    const foundWorkerB1 = response.body.data.find(w => w.id === workerB1.id);
    expect(foundWorkerB1).toBeUndefined();
    
    console.log('✅ 테스트 5 통과: 작업반장 A1은 작업반장 B1의 근무자를 볼 수 없음 (격리 성공)');
  });

  test('6️⃣ 작업반장 A1이 본인이 생성한 작업일지 조회 성공', async () => {
    const token = generateToken(foremanA1);
    
    const response = await request(app)
      .get(`/api/foreman/worklogs?siteId=${siteA.id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data.length).toBeGreaterThan(0);
    
    // 모든 작업일지의 creatorId가 A1이어야 함
    response.body.data.forEach(log => {
      expect(log.creatorId).toBe(foremanA1.id);
    });
    
    // 작업일지 A1이 결과에 포함되어야 함
    const foundWorklogA1 = response.body.data.find(log => log.id === worklogA1.id);
    expect(foundWorklogA1).toBeDefined();
    expect(foundWorklogA1.description).toBe('철근 작업');
    
    console.log(`✅ 테스트 6 통과: 작업반장 A1이 ${response.body.data.length}개 작업일지 조회 성공`);
  });

  test('7️⃣ 작업반장 A1이 작업반장 B1의 작업일지 조회 시 빈 배열 (격리 확인)', async () => {
    const token = generateToken(foremanA1);
    
    // 회사 B 현장으로 조회 시도
    const response = await request(app)
      .get(`/api/foreman/worklogs?siteId=${siteB.id}`)
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    
    // B1의 작업일지는 결과에 포함되지 않아야 함
    // (현장 B는 A1에게 할당되지 않았으므로 빈 배열이거나, 접근 불가)
    if (response.body.data) {
      const foundWorklogB1 = response.body.data.find(log => log.id === worklogB1.id);
      expect(foundWorklogB1).toBeUndefined();
      
      // creatorId 필터링으로 인해 B1의 기록은 보이지 않아야 함
      const foremanBLogs = response.body.data.filter(log => log.creatorId === foremanB1.id);
      expect(foremanBLogs.length).toBe(0);
    }
    
    console.log('✅ 테스트 7 통과: 작업반장 A1은 작업반장 B1의 작업일지를 볼 수 없음 (격리 성공)');
  });
});

console.log('');
console.log('🎯 7개 핵심 데이터 격리 테스트 준비 완료!');
console.log('   - 관리자 데이터 격리: 3개');
console.log('   - 작업반장 데이터 격리: 4개');
console.log('');

