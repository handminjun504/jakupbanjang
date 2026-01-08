/**
 * 주민등록번호 마스킹 유틸리티
 * 
 * 주민등록번호의 뒷자리를 마스킹하여 개인정보를 보호합니다.
 * 
 * @example
 * maskRRN('900101-1234567') // '900101-1******'
 * maskRRN('9001011234567')  // '900101-1******' (하이픈 자동 추가)
 * maskRRN('')               // ''
 * maskRRN(undefined)        // ''
 */
export const maskRRN = (rrn: string | undefined | null): string => {
  if (!rrn) return '';
  
  // 하이픈 제거
  const cleanRRN = rrn.replace(/-/g, '');
  
  // 최소 길이 검증 (앞 6자리 + 뒤 1자리 이상)
  if (cleanRRN.length < 7) return rrn;
  
  // 앞 6자리 + 하이픈 + 뒤 1자리 + 마스킹 (6개 별표)
  return `${cleanRRN.substring(0, 6)}-${cleanRRN.charAt(6)}${'*'.repeat(6)}`;
};

/**
 * 주민등록번호 뒷자리만 마스킹 (하이픈 유지)
 * 
 * @example
 * maskRRNBackOnly('900101-1234567') // '900101-1******'
 */
export const maskRRNBackOnly = (rrn: string | undefined | null): string => {
  if (!rrn) return '';
  
  const parts = rrn.split('-');
  if (parts.length !== 2) return maskRRN(rrn);
  
  const [front, back] = parts;
  if (back.length < 1) return rrn;
  
  return `${front}-${back.charAt(0)}${'*'.repeat(6)}`;
};

