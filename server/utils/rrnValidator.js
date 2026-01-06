/**
 * 대한민국 주민등록번호 유효성 검사 함수
 * @param {string} rrn - 주민등록번호 (13자리 숫자, 하이픈 없음)
 * @returns {boolean} - 유효하면 true, 그렇지 않으면 false
 */
const validateRRN = (rrn) => {
  // 1. 길이 확인 (13자리)
  if (!rrn || rrn.length !== 13) {
    console.log('❌ 주민번호 길이 오류:', rrn?.length);
    return false;
  }

  // 2. 숫자만 포함되어 있는지 확인
  if (!/^\d{13}$/.test(rrn)) {
    console.log('❌ 주민번호 형식 오류: 숫자가 아닌 문자 포함');
    return false;
  }

  // 3. 개발 환경에서는 기본 검증만 수행 (길이 + 숫자)
  if (process.env.NODE_ENV === 'development' || process.env.SKIP_RRN_VALIDATION === 'true') {
    console.log('✅ 개발 모드: 기본 검증만 수행');
    return true;
  }

  // 4. 프로덕션 환경: 주민번호 검증 알고리즘
  // N1 N2 N3 N4 N5 N6 - N7 N8 N9 N10 N11 N12 N13
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(rrn[i]) * weights[i];
  }

  const remainder = sum % 11;
  const checkDigit = 11 - remainder;

  // checkDigit가 10이면 0, 11이면 1로 처리
  const finalCheckDigit = checkDigit >= 10 ? checkDigit % 10 : checkDigit;

  // 마지막 N13과 일치하는지 확인
  const isValid = finalCheckDigit === parseInt(rrn[12]);
  
  if (!isValid) {
    console.log('❌ 주민번호 검증 알고리즘 실패:', { rrn, calculated: finalCheckDigit, actual: parseInt(rrn[12]) });
  }
  
  return isValid;
};

module.exports = { validateRRN };

