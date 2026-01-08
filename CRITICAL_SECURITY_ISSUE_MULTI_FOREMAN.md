# 🚨 긴급 보안 취약점 보고서
**작성일**: 2026-01-08  
**심각도**: ⚠️ **HIGH - 즉시 수정 필요**  
**QA 시간**: 30분

---

## 📋 발견된 문제

### ❌ **문제 1: 작업일지 권한 오류**

#### 현재 구조
```javascript
// server/controllers/foremanController.js:544-603
exports.getWorkLogs = async (req, res) => {
  const companyId = req.user.companyId;
  const creatorId = req.user.id; // 작업반장 본인 ID
  
  // 작업반장은 본인이 작성한 작업일지만 조회 가능
  const whereClause = { siteId, companyId, creatorId };
  
  const workLogs = await Task.findAll({ where: whereClause, ... });
};
```

#### 🔴 **심각한 문제**
**같은 현장을 담당하는 다른 반장의 작업일지를 볼 수 없음!**

**시나리오**:
1. 현장A에 **반장A**와 **반장B** 모두 배정됨 (SiteForemanAssignment)
2. **반장A**가 작업일지 5개 작성
3. **반장B**가 작업일지 3개 작성
4. **반장A**가 작업일지 목록 조회
   - ❌ **반장A의 작업일지 5개만 보임** (creatorId 필터)
   - ❌ **반장B의 작업일지 3개는 안 보임!**

**실제 필요한 동작**:
- ✅ **반장A**: 현장A의 모든 작업일지 8개를 볼 수 있어야 함
- ✅ **반장B**: 현장A의 모든 작업일지 8개를 볼 수 있어야 함

---

### ❌ **문제 2: 지출결의 권한 오류**

#### 현재 구조
```javascript
// server/controllers/foremanController.js:912-959
exports.getExpenses = async (req, res) => {
  const companyId = req.user.companyId;
  const creatorId = req.user.id; // 작업반장은 본인이 작성한 것만 조회
  
  const whereClause = { companyId, creatorId };
  
  const expenses = await Expense.findAll({ where: whereClause, ... });
};
```

#### 🔴 **심각한 문제**
**같은 현장을 담당하는 다른 반장의 지출결의를 볼 수 없음!**

**시나리오**:
1. 현장A에 **반장A**와 **반장B** 모두 배정됨
2. **반장A**가 지출결의 "자재 구매" 등록 (300만원)
3. **반장B**가 지출결의 "장비 대여" 등록 (150만원)
4. **반장A**가 지출결의 목록 조회
   - ❌ **반장A의 지출결의만 보임** (300만원)
   - ❌ **반장B의 지출결의는 안 보임!** (150만원)

**실제 필요한 동작**:
- ✅ **반장A**: 현장A의 모든 지출결의를 볼 수 있어야 함 (450만원)
- ✅ **반장B**: 현장A의 모든 지출결의를 볼 수 있어야 함 (450만원)

---

### ❌ **문제 3: 사진 첨부 권한 오류**

#### 현재 구조
작업일지에 첨부된 사진은 `Attachment` 모델로 관리됩니다.
```javascript
// server/controllers/foremanController.js:564-590
const workLogs = await Task.findAll({
  where: whereClause, // creatorId 필터 적용됨
  include: [
    {
      model: Attachment,
      as: 'attachments'
    }
  ]
});
```

#### 🔴 **심각한 문제**
**같은 현장의 다른 반장이 올린 사진을 볼 수 없음!**

**시나리오**:
1. 현장A에 **반장A**와 **반장B** 배정
2. **반장A**가 작업일지 + 현장 사진 5장 업로드
3. **반장B**가 작업일지 + 현장 사진 3장 업로드
4. **반장A**가 작업일지 목록 조회
   - ❌ **반장A가 올린 사진 5장만 보임**
   - ❌ **반장B가 올린 사진 3장은 안 보임!**

**실제 필요한 동작**:
- ✅ **반장A**: 현장A의 모든 사진 8장을 볼 수 있어야 함
- ✅ **반장B**: 현장A의 모든 사진 8장을 볼 수 있어야 함

---

## 🎯 사용자 요구사항 vs 현재 구현

### 사용자 요구사항
> "1명의 반장이 10개의 현장을 담당하는 경우가 있을수도 있기때문에 **현장별로 등록된 사진과 지출결의 작업일지 등은 등록한 반장과 담당 회사만 볼 수 있어야함**"

> "**같은 현장을 반장 2명 이상이 담당할수도 있음** 이것도 고려해서"

### 현재 구현 문제
| 항목 | 요구사항 | 현재 구현 | 문제 |
|-----|---------|----------|------|
| 작업일지 | 같은 현장의 모든 반장이 볼 수 있어야 함 | ❌ 작성자만 볼 수 있음 | **심각** |
| 지출결의 | 같은 현장의 모든 반장이 볼 수 있어야 함 | ❌ 작성자만 볼 수 있음 | **심각** |
| 사진 첨부 | 같은 현장의 모든 반장이 볼 수 있어야 함 | ❌ 작성자만 볼 수 있음 | **심각** |
| 회사 격리 | 같은 회사만 볼 수 있어야 함 | ✅ companyId 필터 적용 | **정상** |

---

## 🔧 해결 방안

### ✅ 올바른 권한 구조

#### 1. 작업일지 조회 로직 수정
```javascript
// ❌ 현재 (잘못된 로직)
const whereClause = { siteId, companyId, creatorId }; // creatorId 필터 제거 필요!

// ✅ 수정 후 (올바른 로직)
exports.getWorkLogs = async (req, res) => {
  const { siteId, workDate } = req.query;
  const foremanId = req.user.id;
  const companyId = req.user.companyId;
  
  if (!siteId) {
    return res.status(400).json({
      success: false,
      message: '현장 ID가 필요합니다.'
    });
  }
  
  // 1. 해당 현장에 반장이 배정되어 있는지 확인
  const assignment = await SiteForemanAssignment.findOne({
    where: { siteId, foremanId }
  });
  
  if (!assignment) {
    return res.status(403).json({
      success: false,
      message: '해당 현장에 접근 권한이 없습니다.'
    });
  }
  
  // 2. 현장의 모든 작업일지 조회 (creatorId 필터 제거!)
  const whereClause = { siteId, companyId };
  if (workDate) {
    whereClause.workDate = workDate;
  }
  
  const workLogs = await Task.findAll({
    where: whereClause,
    include: [
      {
        model: Worker,
        as: 'worker',
        attributes: ['id', 'name', 'phoneNumber', 'dailyRate', 'status', 'resignedDate']
      },
      {
        model: Site,
        as: 'site',
        attributes: ['id', 'name', 'address']
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'email', 'phone', 'role', 'name'] // 누가 작성했는지 표시
      },
      {
        model: Attachment,
        as: 'attachments'
      }
    ],
    order: [['workDate', 'DESC'], ['createdAt', 'DESC']]
  });
  
  res.status(200).json({
    success: true,
    data: workLogs
  });
};
```

#### 2. 지출결의 조회 로직 수정
```javascript
// ❌ 현재 (잘못된 로직)
const whereClause = { companyId, creatorId }; // creatorId 필터 제거 필요!

// ✅ 수정 후 (올바른 로직)
exports.getExpenses = async (req, res) => {
  const { siteId, status } = req.query;
  const foremanId = req.user.id;
  const companyId = req.user.companyId;
  
  // 1. 반장이 배정된 현장 ID 목록 조회
  const assignments = await SiteForemanAssignment.findAll({
    where: { foremanId },
    attributes: ['siteId']
  });
  
  const assignedSiteIds = assignments.map(a => a.siteId);
  
  if (assignedSiteIds.length === 0) {
    return res.status(200).json({
      success: true,
      data: []
    });
  }
  
  // 2. 배정된 현장의 모든 지출결의 조회 (creatorId 필터 제거!)
  const whereClause = { 
    companyId, 
    siteId: assignedSiteIds // 배정된 현장만
  };
  
  if (siteId) {
    // 특정 현장 필터링 시 권한 확인
    if (!assignedSiteIds.includes(parseInt(siteId))) {
      return res.status(403).json({
        success: false,
        message: '해당 현장에 접근 권한이 없습니다.'
      });
    }
    whereClause.siteId = siteId;
  }
  
  if (status) {
    whereClause.status = status;
  }
  
  const expenses = await Expense.findAll({
    where: whereClause,
    include: [
      {
        model: Site,
        as: 'site',
        attributes: ['id', 'name', 'address']
      },
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'email', 'phone', 'role', 'name'] // 누가 작성했는지 표시
      },
      {
        model: User,
        as: 'approver',
        attributes: ['id', 'email', 'role']
      }
    ],
    order: [['expenseDate', 'DESC'], ['createdAt', 'DESC']]
  });
  
  res.status(200).json({
    success: true,
    data: expenses
  });
};
```

---

## 📊 테스트 시나리오

### 시나리오 1: 다중 현장, 단일 반장
**설정**:
- 반장A: 현장1, 현장2, 현장3 배정
- 반장B: 현장2 배정

**테스트**:
1. ✅ 반장A가 현장1 작업일지 조회 → 현장1의 모든 작업일지 표시
2. ✅ 반장A가 현장2 작업일지 조회 → 현장2의 모든 작업일지 표시 (반장B 작성 포함)
3. ✅ 반장B가 현장2 작업일지 조회 → 현장2의 모든 작업일지 표시 (반장A 작성 포함)
4. ❌ 반장B가 현장1 작업일지 조회 → 403 Forbidden (권한 없음)

### 시나리오 2: 단일 현장, 다중 반장
**설정**:
- 현장X: 반장A, 반장B, 반장C 배정

**테스트**:
1. 반장A: 작업일지 3개 작성
2. 반장B: 작업일지 2개 작성
3. 반장C: 작업일지 5개 작성

**결과**:
- ✅ 반장A 조회 → 10개 모두 표시 (3+2+5)
- ✅ 반장B 조회 → 10개 모두 표시 (3+2+5)
- ✅ 반장C 조회 → 10개 모두 표시 (3+2+5)

### 시나리오 3: 회사 격리
**설정**:
- 회사A: 현장1 (반장A)
- 회사B: 현장2 (반장B)

**테스트**:
1. ✅ 반장A: 현장1 작업일지만 조회 가능
2. ✅ 반장B: 현장2 작업일지만 조회 가능
3. ❌ 반장A: 현장2 작업일지 조회 불가 (다른 회사)
4. ❌ 반장B: 현장1 작업일지 조회 불가 (다른 회사)

---

## 🚨 보안 영향

### 현재 시스템의 문제점
1. **데이터 가시성 부족**: 같은 현장의 다른 반장 작업을 볼 수 없음
2. **협업 불가능**: 여러 반장이 협력하는 현장에서 작업 내역 공유 불가
3. **중복 작업 위험**: 다른 반장이 이미 한 작업을 중복으로 처리할 위험
4. **비용 누락**: 다른 반장의 지출결의를 못 봐서 예산 초과 위험
5. **사진 누락**: 현장 전체 상황 파악 불가

### 수정 후 기대 효과
1. ✅ **완전한 데이터 가시성**: 배정된 현장의 모든 데이터 확인
2. ✅ **효율적인 협업**: 반장 간 작업 내역 공유
3. ✅ **중복 방지**: 다른 반장의 작업 현황 실시간 확인
4. ✅ **정확한 예산 관리**: 현장 전체 비용 파악
5. ✅ **완전한 현장 기록**: 모든 사진 및 문서 확인

---

## ⏰ 수정 우선순위

### P0 (즉시 수정 필요)
1. ✅ **작업일지 권한 수정** (foremanController.getWorkLogs)
2. ✅ **지출결의 권한 수정** (foremanController.getExpenses)

### P1 (24시간 이내)
3. ✅ **UI 개선**: 작업일지/지출결의에 작성자 이름 표시
4. ✅ **통합 테스트**: 다중 현장, 다중 반장 시나리오 테스트

### P2 (1주일 이내)
5. ✅ **문서화**: API 권한 구조 문서화
6. ✅ **모니터링**: 권한 오류 로깅 강화

---

## 📝 결론

**현재 시스템은 "같은 현장을 반장 2명 이상이 담당하는 경우"를 전혀 고려하지 않았습니다.**

**즉시 수정이 필요한 심각한 보안 설계 오류입니다.**

### 핵심 수정 사항
```diff
// 반장 작업일지/지출결의 조회 시
- whereClause = { siteId, companyId, creatorId }  // ❌ 잘못됨
+ whereClause = { siteId, companyId }              // ✅ 올바름 (creatorId 제거)
+ // + SiteForemanAssignment로 권한 확인
```

---

**작성자**: AI Assistant  
**QA 시간**: 30분  
**심각도**: ⚠️ **HIGH**  
**권장 조치**: **즉시 수정 후 재배포**

