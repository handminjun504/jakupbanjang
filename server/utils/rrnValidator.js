/**
 * 대한민국 주민등록번호 유효성 검사 함수
 * @param {string} rrn - 주민등록번호 (13자리 숫자, 하이픈 없음)
 * @returns {boolean} - 유효하면 true, 그렇지 않으면 false
 */
const validateRRN = (rrn) => {
  // 1. 길이 확인 (13자리)
  if (!rrn || rrn.length !== 13) {
    return false;
  }

  // 2. 숫자만 포함되어 있는지 확인
  if (!/^\d{13}$/.test(rrn)) {
    return false;
  }

  // 3. 주민번호 검증 알고리즘
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
  return finalCheckDigit === parseInt(rrn[12]);
};

module.exports = { validateRRN };

