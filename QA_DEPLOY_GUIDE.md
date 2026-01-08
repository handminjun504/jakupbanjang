# 🚀 수정사항 배포 가이드

**수정 완료 시각**: 2026-01-08  
**수정 파일**: `server/controllers/adminController.js`  
**작성 파일**: `REALWORLD_QA_REPORT_2026-01-08.md`  

---

## ✅ 완료된 수정사항

### 1. 현장 생성 API 에러 로깅 개선
```javascript
// 추가된 기능:
✅ 상세한 요청 로깅 (name, address, managerId, companyId 등)
✅ managerId/companyId 검증 강화
✅ startDate/endDate null 처리 명시적 변경
✅ 에러 발생 시 상세한 스택 트레이스 로깅
✅ 개발 환경에서 에러 메시지 반환
```

---

## 📦 배포 방법

### 1단계: Git 권한 설정 (1회만)
```bash
git config --global --add safe.directory E:/jakupbanjang
```

### 2단계: 변경사항 커밋
```bash
cd E:\jakupbanjang

# 변경사항 확인
git status

# 파일 추가
git add server/controllers/adminController.js
git add REALWORLD_QA_REPORT_2026-01-08.md
git add QA_DEPLOY_GUIDE.md

# 커밋
git commit -m "fix: 현장 생성 API 에러 로깅 개선 및 실전 QA 보고서

- createSite 함수에 상세한 에러 로깅 추가
- managerId/companyId 검증 강화  
- startDate/endDate null 처리 명시
- 실전 QA 보고서 작성 (빡센 반장 기준)
- 짜증나는 UX 문제점 정리"
```

### 3단계: Render에 푸시 (자동 배포)
```bash
git push origin main
```

**배포 확인**:
- Render 대시보드: https://dashboard.render.com
- 자동 배포 시작됨 (약 2-3분 소요)
- 배포 로그에서 "Build successful" 확인

---

## 🧪 배포 후 테스트

### 1. API 로그 확인
```bash
# Render 대시보드 → 프로젝트 → Logs

# 현장 생성 시도 시 다음 로그 확인:
🔍 Create site request: { name, address, managerId, companyId, ... }
✅ Site created successfully: <사이트ID>
# 또는
❌ Create site error: <에러 상세>
```

### 2. 프론트엔드 테스트
```
1. https://jakupbanjang-fr.vercel.app/ 접속
2. 관리자 로그인
3. 현장 관리 → + 새 현장 추가
4. 현장명 입력 → 생성 버튼 클릭
5. 결과 확인:
   ✅ 성공: 현장 목록에 추가됨
   ❌ 실패: 콘솔/네트워크 탭에서 에러 확인
```

---

## 📊 예상 결과

### 성공 시나리오
```
✅ 현장이 정상 생성됨
✅ 현장 목록에 즉시 표시
✅ Alert: "현장이 생성되었습니다"
```

### 여전히 실패 시
**Render 로그에서 확인할 내용**:
```bash
❌ Create site error: <구체적인 에러>
Error details: {
  name: 'SequelizeForeignKeyConstraintError',  # 외래 키 문제
  message: 'insert or update on table "sites"',
  sql: 'INSERT INTO sites ...',
  original: ...
}
```

**가능한 원인**:
1. **Company가 없음**: companyId=6이 DB에 없음
   - 해결: checkDB.js로 Company 데이터 확인
   
2. **User가 없음**: managerId=8이 DB에 없음
   - 해결: 로그인한 사용자 정보 확인

3. **테이블 스키마 불일치**: 
   - 해결: 마이그레이션 실행 필요

---

## 🔍 디버깅 명령어

### 로컬에서 직접 테스트
```bash
cd server

# 환경 변수 로드 확인
node checkDB.js

# 서버 시작
npm start

# 다른 터미널에서 API 직접 호출
curl -X POST http://localhost:3001/api/admin/sites \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -d '{
    "name": "로컬 테스트 현장",
    "address": "서울시 강남구"
  }'
```

### JWT 토큰 얻기
```javascript
// 브라우저 콘솔에서 실행
localStorage.getItem('token')
```

---

## 📝 배포 체크리스트

- [ ] Git 권한 설정 완료
- [ ] 변경사항 커밋 완료
- [ ] Render에 푸시 완료
- [ ] Render 배포 성공 확인
- [ ] 프론트엔드에서 현장 생성 테스트
- [ ] 에러 로그 확인 (성공/실패 모두)
- [ ] 전체 플로우 테스트 (현장 → 반장 → 일지)

---

## ⚡ 빠른 배포 (올인원)

```bash
# 1. 권한 설정 (최초 1회)
git config --global --add safe.directory E:/jakupbanjang

# 2. 배포
cd E:\jakupbanjang
git add .
git commit -m "fix: 현장 생성 API 개선"
git push origin main

# 3. Render 대시보드에서 배포 확인
# https://dashboard.render.com
```

---

**작성자**: AI QA Engineer  
**다음 단계**: 배포 후 전체 플로우 QA (40분)

