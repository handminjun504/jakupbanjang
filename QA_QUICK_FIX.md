# 🔧 빠른 수정 가이드

## 즉시 해결 가능한 이슈 (5분 이내)

### 1. 포트 충돌 해결 ⚡

**방법 A: 기존 프로세스 종료**
```powershell
# 포트 3001 사용 중인 프로세스 확인
netstat -ano | findstr :3001

# 프로세스 종료 (PID 확인 후)
taskkill /PID [프로세스ID] /F
```

**방법 B: 다른 포트 사용**
```bash
# server/.env 파일 수정
PORT=3002
```

### 2. TypeScript 캐시 문제 해결 ⚡

```bash
cd client

# 캐시 삭제
rm -rf node_modules/.cache
rm -rf .cache

# 재시작
npm start
```

### 3. 서버 정상 시작 확인 ✅

```bash
cd server
npm start

# 예상 출력:
# ✅ Database connection has been established successfully.
# ✅ Bucket work-logs already exists
# ✅ Bucket expenses already exists
# ✅ Bucket attachments already exists
# 🚀 Server is running on http://localhost:3001
```

---

## 프론트엔드 빠른 테스트 (10분)

### 1. 로그인 테스트
```
URL: http://localhost:3000
테스트 계정:
- 이메일: handminjun504@gmail.com (관리자)
- 이메일: wapeople000@gmail.com (관리자)
- 전화번호: 01056060641 (작업반장)
```

### 2. 주요 기능 확인
- [ ] 로그인 성공
- [ ] 대시보드 로드
- [ ] 현장 목록 조회
- [ ] 근무자 목록 조회
- [ ] 작업일지 목록 조회
- [ ] 지출결의 목록 조회

### 3. 데이터 격리 확인
- [ ] 다른 회사 데이터 안 보임
- [ ] 다른 작업반장 데이터 안 보임
- [ ] 본인 데이터만 조회됨

---

## 배포 전 최종 체크리스트

### 환경 변수 확인
```bash
cd server
cat .env

# 필수 항목:
✅ DATABASE_URL
✅ SUPABASE_URL
✅ SUPABASE_ANON_KEY
✅ JWT_SECRET (32자 이상)
✅ ENCRYPTION_KEY (정확히 32자)
```

### 보안 설정 확인
```bash
# JWT_SECRET 변경 (프로덕션)
JWT_SECRET="[64자 이상의 강력한 랜덤 문자열]"

# NODE_ENV 변경
NODE_ENV="production"
```

### 빌드 테스트
```bash
# 클라이언트 빌드
cd client
npm run build

# 예상 출력:
# Creating an optimized production build...
# Compiled successfully.
```

---

## 현재 상태 요약

### ✅ 정상 작동
- 데이터베이스 연결
- Supabase Storage
- 환경 변수 설정
- 보안 기능 (암호화, 데이터 격리)
- 5개 회사, 6명 사용자 운영 중

### ⚠️ 수정 필요
- 포트 3001 충돌 (5분)
- TypeScript 캐시 (5분)
- 프론트엔드 빌드 확인 (5분)

### 배포 준비도: 80% → 100% (15분 소요)

---

**다음 명령어로 빠르게 시작:**

```bash
# 1. 서버 시작 (새 터미널)
cd E:\jakupbanjang\server
npm start

# 2. 클라이언트 시작 (새 터미널)
cd E:\jakupbanjang\client
npm start

# 3. 브라우저 열기
# http://localhost:3000
```

