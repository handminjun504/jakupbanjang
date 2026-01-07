# 접근 권한 및 데이터 분리 가이드

## 🔒 보안 정책 개요

본 시스템은 **업체별 데이터 분리** 및 **작업반장별 권한 제한**을 통해 보안을 강화합니다.

---

## 📊 데이터 분리 구조

### 1. 업체별 분리 (Company Level)

**모든 데이터는 `companyId`로 분리됩니다:**

```
Company A (companyId: 1)
├── 현장 1, 2, 3
├── 작업반장 A1, A2
├── 근무자 1~10
└── 작업일지, 지출결의

Company B (companyId: 2)
├── 현장 4, 5
├── 작업반장 B1, B2
├── 근무자 11~20
└── 작업일지, 지출결의
```

**결과:**
- Company A의 관리자는 Company B의 데이터를 볼 수 없음
- Company A의 작업반장은 Company B의 데이터를 볼 수 없음

---

### 2. 작업반장별 분리 (Foreman Level)

**작업반장은 본인이 작성한 데이터만 조회 가능:**

```
작업반장 A (foremanId: 101, creatorId: 101)
├── 본인이 등록한 근무자만 조회 (Worker.foremanId = 101)
├── 본인이 작성한 작업일지만 조회 (Task.creatorId = 101)
└── 본인이 작성한 지출결의만 조회 (Expense.creatorId = 101)

작업반장 B (foremanId: 102, creatorId: 102)
├── 본인이 등록한 근무자만 조회 (Worker.foremanId = 102)
├── 본인이 작성한 작업일지만 조회 (Task.creatorId = 102)
└── 본인이 작성한 지출결의만 조회 (Expense.creatorId = 102)
```

**결과:**
- 같은 회사 내에서도 작업반장 A는 작업반장 B의 기록을 볼 수 없음
- 작업반장 교체 시 새 작업반장은 이전 작업반장의 기록을 볼 수 없음

---

## 🔑 권한별 접근 제어

### 관리자 (Manager)

✅ **가능한 작업:**
- 모든 현장 조회/생성/수정/삭제
- 모든 작업일지 조회 (본인 회사 내)
- 모든 근무자 조회 (본인 회사 내)
- 모든 지출결의 조회 및 승인/반려
- 작업반장 현장 할당/변경
- 대시보드 통계 조회

❌ **불가능한 작업:**
- 다른 회사 데이터 조회
- 작업일지/지출결의 직접 등록 (작업반장만 가능)

### 작업반장 (Foreman)

✅ **가능한 작업:**
- 본인이 등록한 근무자 조회/수정/삭제
- 본인이 작성한 작업일지 조회/등록/수정
- 본인이 작성한 지출결의 조회/등록
- 할당된 현장 조회

❌ **불가능한 작업:**
- 다른 작업반장의 데이터 조회
- 현장 생성/수정/삭제
- 지출결의 승인/반려 (관리자만 가능)
- 다른 회사 데이터 조회

---

## 🔄 작업반장 교체 시나리오

### 시나리오: 현장 A의 작업반장 교체

**Before:**
```
현장 A
└── 작업반장 김철수 (foremanId: 101)
    ├── 근무자: 홍길동, 이영희
    ├── 작업일지: 2025-01-01 ~ 2025-01-15
    └── 지출결의: 3건
```

**관리자 작업: 작업반장 변경**
```javascript
// POST /api/admin/sites/1/assign-foremen
{
  "foremanIds": [102]  // 박영수로 변경
}
```

**After:**
```
현장 A
├── 작업반장 김철수 (foremanId: 101) - 할당 해제
│   ├── 근무자: 홍길동, 이영희 (여전히 foremanId: 101)
│   ├── 작업일지: 2025-01-01 ~ 2025-01-15 (creatorId: 101)
│   └── 지출결의: 3건 (creatorId: 101)
│
└── 작업반장 박영수 (foremanId: 102) - 새로 할당
    ├── 근무자: (없음) - 새로 등록해야 함
    ├── 작업일지: (없음) - 새로 작성해야 함
    └── 지출결의: (없음) - 새로 작성해야 함
```

### 각자 조회 가능한 데이터

**김철수 (이전 작업반장):**
- ✅ 본인이 등록한 근무자 (홍길동, 이영희)
- ✅ 본인이 작성한 작업일지 (2025-01-01 ~ 2025-01-15)
- ✅ 본인이 작성한 지출결의 (3건)
- ❌ 현장 A 접근 불가 (할당 해제됨)

**박영수 (새 작업반장):**
- ❌ 김철수가 등록한 근무자 조회 불가
- ❌ 김철수가 작성한 작업일지 조회 불가
- ❌ 김철수가 작성한 지출결의 조회 불가
- ✅ 현장 A 접근 가능
- ✅ 본인이 새로 등록/작성하는 데이터만 조회 가능

**관리자:**
- ✅ 모든 데이터 조회 가능 (김철수 + 박영수)
- ✅ 통합 통계 및 보고서 조회
- ✅ 모든 지출결의 승인/반려

---

## 🗂️ 파일 저장 구조 (Supabase Storage)

### 업체별 폴더 분리

```
work-logs/
├── company-1/
│   ├── worklog_123_xxx.jpg  (회사 1의 작업일지 사진)
│   └── worklog_124_xxx.png
├── company-2/
│   └── worklog_201_xxx.jpg  (회사 2의 작업일지 사진)
└── company-3/
    └── worklog_301_xxx.jpg

expenses/
├── company-1/
│   └── expense_xxx.pdf  (회사 1의 지출결의 파일)
├── company-2/
│   └── expense_xxx.jpg  (회사 2의 지출결의 파일)
└── company-3/
    └── expense_xxx.pdf
```

**장점:**
- 업체별 파일 관리 용이
- Storage 브라우저에서 회사별 조회 가능
- 향후 회사별 용량 제한 설정 가능

---

## 🔍 API 엔드포인트별 접근 제어

### 작업반장 엔드포인트 (`/api/foreman`)

| 엔드포인트 | 필터링 | 설명 |
|-----------|--------|------|
| `GET /workers` | `foremanId = req.user.id` | 본인이 등록한 근무자만 |
| `GET /worklogs` | `creatorId = req.user.id` | 본인이 작성한 작업일지만 |
| `GET /expenses` | `creatorId = req.user.id` | 본인이 작성한 지출결의만 |
| `GET /sites` | `assignedSites` | 할당된 현장만 |

### 관리자 엔드포인트 (`/api/admin`)

| 엔드포인트 | 필터링 | 설명 |
|-----------|--------|------|
| `GET /worklogs` | `companyId = req.user.companyId` | 본인 회사 모든 작업일지 |
| `GET /workers` | `companyId = req.user.companyId` | 본인 회사 모든 근무자 |
| `GET /expenses` | `companyId = req.user.companyId` | 본인 회사 모든 지출결의 |
| `GET /sites` | `companyId = req.user.companyId` | 본인 회사 모든 현장 |

---

## 📋 코드 예시

### 작업일지 조회 (작업반장)

```javascript
// server/controllers/foremanController.js - getWorkLogs
const whereClause = { 
  siteId,           // 현장 ID
  companyId,        // 회사 ID
  creatorId         // ✅ 본인이 작성한 것만!
};
```

### 근무자 조회 (작업반장)

```javascript
// server/controllers/foremanController.js - getWorkersBySite
const workers = await Worker.findAll({
  where: { 
    foremanId,      // ✅ 본인이 등록한 것만!
    status: 'active' 
  }
});
```

### 작업반장 할당 변경 (관리자)

```javascript
// server/controllers/adminController.js - assignForemenToSite
// 기존 할당 삭제
await SiteForemanAssignment.destroy({
  where: { siteId: id }
});

// 새 작업반장 할당
for (const foremanId of foremanIds) {
  await SiteForemanAssignment.create({
    siteId: id,
    foremanId: foremanId
  });
}
```

---

## ⚠️ 주의사항

1. **작업반장 교체 전 데이터 인계**
   - 필요시 관리자가 대시보드에서 이전 기록 확인
   - 중요 데이터는 교체 전 백업 또는 CSV 다운로드

2. **근무자 데이터 이관**
   - 작업반장 교체 시 근무자 데이터는 자동 이관되지 않음
   - 필요시 관리자가 수동으로 근무자의 `foremanId` 변경
   - 또는 새 작업반장이 근무자를 재등록

3. **현장 할당**
   - 한 현장에 여러 작업반장 할당 가능
   - 각 작업반장은 본인의 데이터만 조회

4. **데이터 완전 분리**
   - 작업반장 간 데이터 공유 불가
   - 협업이 필요한 경우 관리자 대시보드 활용

---

## 🎯 결론

✅ **업체별 완전 분리**: companyId로 회사 데이터 격리
✅ **작업반장별 분리**: creatorId/foremanId로 개인 데이터 격리
✅ **작업반장 교체 지원**: 새 작업반장은 이전 기록 조회 불가
✅ **관리자 통합 관리**: 관리자는 모든 데이터 조회 및 관리 가능
✅ **파일 자동 분류**: 업체별 폴더 자동 생성

이를 통해 **보안**, **프라이버시**, **데이터 무결성**을 보장합니다.

