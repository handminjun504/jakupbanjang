/**
 * 비밀번호 재설정 스크립트 (개발용)
 * 사용법: node resetPassword.js [userId] [newPassword]
 * 예: node resetPassword.js 1 newpassword123
 */
const sequelize = require('./config/database');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const setupAssociations = require('./config/associations');

setupAssociations();

async function resetPassword() {
  try {
    const userId = process.argv[2];
    const newPassword = process.argv[3];

    if (!userId || !newPassword) {
      console.log('❌ 사용법: node resetPassword.js [userId] [newPassword]');
      console.log('예: node resetPassword.js 1 123456');
      process.exit(1);
    }

    await sequelize.authenticate();

    const user = await User.findByPk(userId);
    if (!user) {
      console.log(`❌ ID ${userId}인 사용자를 찾을 수 없습니다.`);
      process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    console.log('========================================');
    console.log('✅ 비밀번호 재설정 완료!');
    console.log('========================================');
    console.log(`사용자 ID: ${user.id}`);
    console.log(`이메일: ${user.email || '없음'}`);
    console.log(`전화번호: ${user.phone || '없음'}`);
    console.log(`역할: ${user.role}`);
    console.log(`새 비밀번호: ${newPassword}`);
    console.log('========================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

resetPassword();

