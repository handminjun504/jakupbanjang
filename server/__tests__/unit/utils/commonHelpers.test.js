/**
 * commonHelpers 단위 테스트
 */

const {
  getWorkerDisplayName,
  validateCompanyId,
  validateOwnership,
  formatDate,
  getPagination,
  getPaginationMeta
} = require('../../../utils/commonHelpers');

describe('CommonHelpers - getWorkerDisplayName', () => {
  test('재직 중인 근무자 이름 반환', () => {
    const worker = { name: '홍길동', status: 'active' };
    expect(getWorkerDisplayName(worker)).toBe('홍길동');
  });

  test('퇴사한 근무자는 (퇴사) 표시', () => {
    const worker = { name: '김철수', status: 'resigned' };
    expect(getWorkerDisplayName(worker)).toBe('김철수 (퇴사)');
  });

  test('이름이 없으면 "이름 없음" 반환', () => {
    const worker = { status: 'active' };
    expect(getWorkerDisplayName(worker)).toBe('이름 없음');
  });

  test('worker가 null이면 "이름 없음" 반환', () => {
    expect(getWorkerDisplayName(null)).toBe('이름 없음');
  });
});

describe('CommonHelpers - validateCompanyId', () => {
  test('회사 ID가 일치하면 true 반환', () => {
    const entity = { companyId: 1 };
    expect(validateCompanyId(entity, 1)).toBe(true);
  });

  test('회사 ID가 다르면 false 반환', () => {
    const entity = { companyId: 1 };
    expect(validateCompanyId(entity, 2)).toBe(false);
  });

  test('entity가 null이면 false 반환', () => {
    expect(validateCompanyId(null, 1)).toBe(false);
  });
});

describe('CommonHelpers - validateOwnership', () => {
  test('소유자가 일치하면 true 반환', () => {
    const entity = { creatorId: 10 };
    expect(validateOwnership(entity, 10)).toBe(true);
  });

  test('소유자가 다르면 false 반환', () => {
    const entity = { creatorId: 10 };
    expect(validateOwnership(entity, 20)).toBe(false);
  });

  test('커스텀 외래 키 사용 가능', () => {
    const entity = { foremanId: 5 };
    expect(validateOwnership(entity, 5, 'foremanId')).toBe(true);
  });
});

describe('CommonHelpers - formatDate', () => {
  test('Date 객체를 YYYY-MM-DD 형식으로 변환', () => {
    const date = new Date('2025-10-30T10:30:00Z');
    expect(formatDate(date)).toBe('2025-10-30');
  });

  test('문자열 날짜를 YYYY-MM-DD 형식으로 변환', () => {
    expect(formatDate('2025-12-25')).toBe('2025-12-25');
  });

  test('null 입력 시 null 반환', () => {
    expect(formatDate(null)).toBe(null);
  });
});

describe('CommonHelpers - getPagination', () => {
  test('페이지 1, limit 20 → offset 0', () => {
    const result = getPagination(1, 20);
    expect(result).toEqual({ offset: 0, limit: 20 });
  });

  test('페이지 3, limit 10 → offset 20', () => {
    const result = getPagination(3, 10);
    expect(result).toEqual({ offset: 20, limit: 10 });
  });

  test('기본값: 페이지 1, limit 20', () => {
    const result = getPagination();
    expect(result).toEqual({ offset: 0, limit: 20 });
  });

  test('잘못된 입력은 기본값으로 처리', () => {
    const result = getPagination('invalid', 'invalid');
    expect(result).toEqual({ offset: 0, limit: 20 });
  });
});

describe('CommonHelpers - getPaginationMeta', () => {
  test('전체 100개, 페이지 1, limit 20 → 5페이지', () => {
    const meta = getPaginationMeta(100, 1, 20);
    expect(meta).toEqual({
      totalCount: 100,
      totalPages: 5,
      currentPage: 1,
      perPage: 20,
      hasNextPage: true,
      hasPrevPage: false
    });
  });

  test('마지막 페이지는 hasNextPage false', () => {
    const meta = getPaginationMeta(100, 5, 20);
    expect(meta.hasNextPage).toBe(false);
    expect(meta.hasPrevPage).toBe(true);
  });

  test('항목이 0개면 페이지도 0', () => {
    const meta = getPaginationMeta(0, 1, 20);
    expect(meta.totalPages).toBe(0);
  });
});

