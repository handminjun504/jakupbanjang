# ⚡ QA 즉시 조치 사항

**생성 일시**: 2026-01-08  
**우선순위**: 🔴 크리티컬  

---

## 🔴 즉시 수정 필요 (블로커)

### 1. 현장 생성 API 500 에러 🚨

**상태**: ❌ 실패  
**우선순위**: P0 (최고)  
**예상 소요 시간**: 30분 - 1시간  

#### 문제 설명
```
POST /api/admin/sites => 500 Internal Server Error
```

#### 디버깅 체크리스트
- [ ] 백엔드 서버 로그 확인 (`server/logs/error.log`)
- [ ] 데이터베이스 제약 조건 확인
  ```sql
  SELECT * FROM information_schema.table_constraints 
  WHERE table_name = 'sites';
  ```
- [ ] API 라우터 코드 확인 (`server/routes/admin.js`)
- [ ] Site 모델 확인 (`server/models/Site.js`)
- [ ] 필수 필드 확인 (name, creatorId, companyId)

#### 의심 원인 우선순위
1. **creatorId 또는 companyId 누락** (가능성 80%)
   - 회원가입 시 생성된 companyId: `6`
   - 사용자 ID: `8`
   - 이 값들이 현장 생성 시 제대로 전달되는지 확인

2. **데이터베이스 외래 키 제약 위반** (가능성 15%)
   - foremenIds 배열 처리 오류
   - 존재하지 않는 작업반장 ID 참조

3. **서버 환경 변수 문제** (가능성 5%)
   - DATABASE_URL 연결 문제
   - Supabase 권한 문제

#### 빠른 수정 방법
```javascript
// server/routes/admin.js 또는 해당 파일

// 현재 코드 (추정)
router.post('/sites', authenticateToken, async (req, res) => {
  try {
    const { name, address, startDate, endDate, foremenIds } = req.body;
    
    // ⚠️ 문제: companyId나 creatorId가 누락되었을 가능성
    const newSite = await Site.create({
      name,
      address,
      startDate,
      endDate,
      // companyId: ???  <- 이 부분 확인 필요
      // creatorId: ???  <- 이 부분 확인 필요
    });
    
    res.status(201).json(newSite);
  } catch (error) {
    console.error(error);  // 이 로그 확인!
    res.status(500).json({ error: error.message });
  }
});

// 수정 후 코드 (권장)
router.post('/sites', authenticateToken, async (req, res) => {
  try {
    const { name, address, startDate, endDate, foremenIds } = req.body;
    
    // ✅ 토큰에서 사용자 정보 추출
    const userId = req.user.id;
    const companyId = req.user.companyId;
    
    // ✅ 유효성 검사
    if (!name || !companyId) {
      return res.status(400).json({ 
        error: '필수 필드가 누락되었습니다' 
      });
    }
    
    const newSite = await Site.create({
      name,
      address,
      startDate,
      endDate,
      companyId,      // ✅ 추가
      creatorId: userId,  // ✅ 추가
      status: 'active',   // ✅ 기본값
    });
    
    res.status(201).json(newSite);
  } catch (error) {
    console.error('현장 생성 오류:', error);  // ✅ 상세 로그
    res.status(500).json({ 
      error: '현장 생성에 실패했습니다',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
```

#### 테스트 방법
```bash
# 1. 로컬에서 테스트
cd server
npm start

# 2. API 직접 호출 (Postman/curl)
curl -X POST https://jakupbanjang-api.onrender.com/api/admin/sites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "테스트 현장",
    "address": "서울시 강남구",
    "startDate": "2026-01-09",
    "endDate": "2026-12-31"
  }'

# 3. 에러 로그 확인
# Render 대시보드에서 실시간 로그 확인
```

---

## 🟡 다음 우선순위 작업

### 2. 에러 메시지 사용자 친화적으로 개선

**상태**: ⚠️ 개선 필요  
**우선순위**: P1  
**예상 소요 시간**: 15분  

#### 현재 상태
```javascript
// 프론트엔드 - 현재
alert("Request failed with status code 500");
```

#### 개선 후
```javascript
// 프론트엔드 - 개선
const errorMessages = {
  400: '입력 정보를 확인해주세요.',
  401: '로그인이 필요합니다.',
  403: '권한이 없습니다.',
  404: '데이터를 찾을 수 없습니다.',
  500: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
};

alert(errorMessages[error.response?.status] || '오류가 발생했습니다.');
```

---

### 3. 작업반장 회원가입 및 로그인 테스트

**상태**: ⏭️ 미테스트  
**우선순위**: P1  
**예상 소요 시간**: 15분  

#### 테스트 시나리오
1. 작업반장 회원가입
   - 초대 코드: `0NDF-6U71` 사용
   - 전화번호: `01012345678`
   - 이름: `테스트반장`
   - 비밀번호: `Test1234!@#$`

2. 작업반장 로그인
   - 전화번호로 로그인

3. 작업반장 대시보드 확인

---

### 4. 데이터 격리 테스트

**상태**: ⏭️ 미테스트  
**우선순위**: P1  
**예상 소요 시간**: 30분  

#### 테스트 시나리오
1. 회사 A 관리자 로그인
2. 현장 1개 생성
3. 로그아웃
4. 회사 B 관리자 로그인
5. 회사 A의 현장이 보이는지 확인 ❌
6. API 직접 호출로 회사 A 데이터 접근 시도 ❌

**예상 결과**: 다른 회사 데이터는 절대 보이면 안됨

---

## 📋 전체 우선순위 매트릭스

| 작업 | 우선순위 | 상태 | 소요 시간 | 담당자 |
|------|---------|------|----------|--------|
| 현장 생성 API 수정 | P0 🔴 | 진행 중 | 1시간 | 백엔드 |
| 에러 메시지 개선 | P1 🟡 | 대기 | 15분 | 프론트 |
| 작업반장 플로우 | P1 🟡 | 대기 | 15분 | QA |
| 데이터 격리 테스트 | P1 🟡 | 대기 | 30분 | QA |
| 파일 업로드 테스트 | P2 🟢 | 대기 | 30분 | QA |
| 전체 CRUD 테스트 | P2 🟢 | 대기 | 1시간 | QA |

---

## 🚀 빠른 실행 명령어

### 로컬 개발 서버 시작
```bash
# 백엔드
cd server
npm start

# 프론트엔드
cd client
npm start
```

### 데이터베이스 확인
```bash
cd server
node checkDB.js
```

### 로그 확인
```bash
# Render 로그 (실시간)
# Render 대시보드 → 프로젝트 → Logs

# 로컬 로그
tail -f server/logs/error.log
```

---

## 📞 긴급 연락

**현장 생성 API 이슈**:
- 백엔드 개발자에게 즉시 전달
- 우선순위: P0 (최고)
- 예상 배포 시간: 수정 후 30분 이내

---

**작성자**: AI QA Engineer  
**최종 업데이트**: 2026-01-08  
**다음 업데이트**: 현장 생성 API 수정 후

