const crypto = require('crypto');

// 암호화 키 (환경변수에서 가져오거나 기본값 사용)
// 프로덕션에서는 반드시 환경변수로 설정해야 함!
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'jakup-default-encryption-key-32'; // 32자
const IV_LENGTH = 16; // AES의 경우 16바이트

/**
 * 주민등록번호 암호화 (AES-256-CBC)
 * @param {string} text - 암호화할 텍스트
 * @returns {string} - 암호화된 텍스트 (iv:encrypted 형태)
 */
function encryptRRN(text) {
  try {
    // 키를 32바이트로 조정
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // IV와 암호화된 데이터를 함께 저장 (콜론으로 구분)
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('암호화에 실패했습니다.');
  }
}

/**
 * 주민등록번호 복호화 (AES-256-CBC)
 * @param {string} text - 복호화할 텍스트 (iv:encrypted 형태)
 * @returns {string} - 복호화된 원본 텍스트
 */
function decryptRRN(text) {
  try {
    const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('복호화에 실패했습니다.');
  }
}

/**
 * 주민등록번호 마스킹
 * @param {string} rrn - 주민등록번호 (13자리)
 * @returns {string} - 마스킹된 주민등록번호 (123456-1******)
 */
function maskRRN(rrn) {
  const cleanRRN = rrn.replace(/-/g, '');
  if (cleanRRN.length === 13) {
    return `${cleanRRN.substring(0, 6)}-${cleanRRN.substring(6, 7)}******`;
  }
  return rrn;
}

module.exports = {
  encryptRRN,
  decryptRRN,
  maskRRN
};

