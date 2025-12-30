/**
 * DB 동기화 에러 디버깅 스크립트
 */
const sequelize = require('./config/database');
const setupAssociations = require('./config/associations');

// 모든 모델 로드
const User = require('./models/User');
const Company = require('./models/Company');
const Site = require('./models/Site');
const Worker = require('./models/Worker');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const Attachment = require('./models/Attachment');
const Expense = require('./models/Expense');

setupAssociations();

async function debugSync() {
  try {
    console.log('========================================');
    console.log('🔍 DB 동기화 테스트');
    console.log('========================================\n');

    await sequelize.authenticate();
    console.log('✅ DB 연결 성공\n');

    console.log('📊 동기화 시도 (alter: true)...\n');
    
    // 각 모델별로 동기화 시도
    const models = [
      { name: 'Company', model: Company },
      { name: 'User', model: User },
      { name: 'Site', model: Site },
      { name: 'Worker', model: Worker },
      { name: 'Task', model: Task },
      { name: 'Comment', model: Comment },
      { name: 'Attachment', model: Attachment },
      { name: 'Expense', model: Expense }
    ];

    for (const { name, model } of models) {
      try {
        await model.sync({ alter: true });
        console.log(`✅ ${name} 동기화 성공`);
      } catch (error) {
        console.log(`❌ ${name} 동기화 실패:`);
        console.log(`   에러: ${error.message}`);
        console.log(`   상세: ${error.original?.message || 'N/A'}`);
      }
    }

    console.log('\n========================================');
    console.log('✅ 테스트 완료!');
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ 치명적 오류:', error.message);
    console.error(error);
    process.exit(1);
  }
}

debugSync();

