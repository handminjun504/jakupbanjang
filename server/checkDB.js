/**
 * DB 상태 확인 스크립트
 * 사용법: node checkDB.js
 */
const sequelize = require('./config/database');
const User = require('./models/User');
const Company = require('./models/Company');
const setupAssociations = require('./config/associations');

setupAssociations();

async function checkDatabase() {
  try {
    console.log('========================================');
    console.log('🔍 데이터베이스 상태 확인');
    console.log('========================================\n');

    // DB 연결 확인
    await sequelize.authenticate();
    console.log('✅ DB 연결 성공\n');

    // Company 개수 확인
    const companyCount = await Company.count();
    console.log(`📊 Company 개수: ${companyCount}`);
    
    if (companyCount > 0) {
      const companies = await Company.findAll({
        attributes: ['id', 'name', 'inviteCode', 'createdAt']
      });
      console.log('회사 목록:');
      companies.forEach(c => {
        console.log(`  - ID: ${c.id}, 이름: ${c.name}, 초대코드: ${c.inviteCode}`);
      });
    }
    console.log('');

    // User 개수 확인
    const userCount = await User.count();
    console.log(`👤 User 개수: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.findAll({
        attributes: ['id', 'email', 'phone', 'role', 'companyId', 'createdAt'],
        include: [{
          model: Company,
          as: 'company',
          attributes: ['name']
        }]
      });
      console.log('사용자 목록:');
      users.forEach(u => {
        console.log(`  - ID: ${u.id}`);
        console.log(`    이메일: ${u.email || '없음'}`);
        console.log(`    전화번호: ${u.phone || '없음'}`);
        console.log(`    역할: ${u.role}`);
        console.log(`    회사ID: ${u.companyId} (${u.company?.name || '알 수 없음'})`);
        console.log(`    가입일: ${u.createdAt}`);
        console.log('');
      });
    }

    console.log('========================================');
    console.log('✅ 확인 완료!');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkDatabase();

