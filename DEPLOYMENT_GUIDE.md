# 🚀 Vercel & Render 배포 가이드

## 📋 배포 개요

```
Frontend (React) → Vercel
Backend (Express) → Render
Database → Supabase PostgreSQL ✅ (이미 설정됨)
Storage → Supabase Storage ✅ (이미 설정됨)
```

**총 비용: 무료!** 🎉

---

## 1️⃣ Backend 먼저 배포 (Render)

### A. Render 계정 생성

1. https://render.com 접속
2. GitHub 계정으로 로그인
3. "New +" → "Web Service" 클릭

### B. GitHub 저장소 연결

1. **저장소 선택**: `handminjun504/jakupbanjang`
2. **이름**: `jakupbanjang-api`
3. **Region**: Oregon (또는 Singapore - 한국과 가까움)
4. **Branch**: `main`
5. **Root Directory**: `server` ⭐ 중요!
6. **Environment**: `Node`
7. **Build Command**: `npm install`
8. **Start Command**: `node index.js`
9. **Instance Type**: `Free`

### C. 환경 변수 설정 (Render)

**중요! 아래 환경 변수를 정확히 입력하세요:**

```bash
# Node 환경
NODE_ENV=production
PORT=10000

# Supabase 설정 (현재 사용 중인 값 그대로 복사)
DATABASE_URL=postgresql://postgres.nkkmghnqupknpsxksmvi:cjdsusemfQW@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

SUPABASE_URL=https://nkkmghnqupknpsxksmvi.supabase.co

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra21naG5xdXBrbnBzeGtzbXZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njk5MjI1NSwiZXhwIjoyMDgyNTY4MjU1fQ.AQOLuu0Ivp58gkGAvV62MS6ppdrChdmFdHStiVmoqZo

SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra21naG5xdXBrbnBzeGtzbXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTIyNTUsImV4cCI6MjA4MjU2ODI1NX0.Y7bSO-U6JXthRjNRMGR1vecvF_kH73EZKaHwJ9wOBvg

# JWT Secret (보안키 - 원하는 랜덤 문자열)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345

# 암호화 키 (32자 이상 랜덤 문자열)
ENCRYPTION_KEY=your-32-character-encryption-key-change-this!!

# Frontend URL (나중에 Vercel 배포 후 업데이트)
CLIENT_URL=https://your-app.vercel.app
```

### D. 배포 시작

1. "Create Web Service" 클릭
2. ⏱️ 5~10분 대기 (빌드 & 배포)
3. ✅ 배포 완료!

### E. Backend URL 확인

배포 완료 후 상단에 URL이 표시됩니다:
```
https://jakupbanjang-api-xxxx.onrender.com
```

**이 URL을 복사해두세요!** 📋

---

## 2️⃣ Frontend 배포 (Vercel)

### A. Vercel 계정 생성

1. https://vercel.com 접속
2. GitHub 계정으로 로그인

### B. 프로젝트 Import

1. "Add New..." → "Project" 클릭
2. **저장소 선택**: `handminjun504/jakupbanjang`
3. "Import" 클릭

### C. 프로젝트 설정

```
Project Name: jakupbanjang
Framework Preset: Create React App (자동 감지됨)
Root Directory: client ⭐ 중요!
Build Command: npm run build (자동)
Output Directory: build (자동)
Install Command: npm install (자동)
```

### D. 환경 변수 설정 (Vercel)

**Environment Variables 섹션에서:**

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://jakupbanjang-api-xxxx.onrender.com` |

⚠️ **주의**: 위의 URL은 **1단계에서 확인한 Render URL**을 입력하세요!

### E. 배포 시작

1. "Deploy" 클릭
2. ⏱️ 2~5분 대기
3. ✅ 배포 완료!

### F. Frontend URL 확인

배포 완료 후:
```
https://jakupbanjang-xxxx.vercel.app
```

**이 URL을 복사해두세요!** 📋

---

## 3️⃣ Backend에 Frontend URL 등록

### Render 대시보드로 돌아가기

1. Render 대시보드 → `jakupbanjang-api` 클릭
2. **Environment** 탭 클릭
3. `CLIENT_URL` 환경 변수 찾기
4. 값을 **Vercel에서 받은 URL**로 변경:
   ```
   https://jakupbanjang-xxxx.vercel.app
   ```
5. "Save Changes" 클릭
6. ⏱️ 서비스 자동 재시작 (1~2분)

---

## 4️⃣ GitHub에 배포 설정 푸시

모든 설정 파일을 GitHub에 푸시합니다:

```bash
cd /Users/sonminjun/Downloads/jakupbanjang
git add .
git commit -m "Add Vercel & Render deployment configuration"
git push origin main
```

---

## 5️⃣ 배포 완료 확인

### ✅ 체크리스트

1. **Backend 확인**:
   - URL: `https://jakupbanjang-api-xxxx.onrender.com`
   - 브라우저에서 접속 → "jakupbanjang API Server" 표시되면 성공!

2. **Frontend 확인**:
   - URL: `https://jakupbanjang-xxxx.vercel.app`
   - 로그인 페이지가 보이면 성공!

3. **회원가입 테스트**:
   - 관리자 회원가입 시도
   - ✅ 성공하면 모든 연동 완료!

---

## 🔧 배포 후 관리

### Render 무료 티어 주의사항

**슬립 모드:**
- 15분간 요청 없으면 서버 정지
- 첫 요청 시 재시작 (30초~1분 소요)
- 해결책: 무료 업타임 모니터링 사용

**추천 서비스:**
- UptimeRobot (https://uptimerobot.com)
- 5분마다 Backend에 요청 보내서 슬립 방지

### Vercel 자동 배포

GitHub에 push하면:
- ✅ Vercel이 자동으로 감지
- ✅ 자동으로 빌드 & 배포
- ✅ 몇 분 안에 업데이트 완료!

### Render 자동 배포

GitHub에 push하면:
- ✅ Render도 자동으로 감지
- ✅ 자동으로 빌드 & 배포

---

## 🆘 문제 해결

### 1. CORS 오류

**증상**: 브라우저 콘솔에 "CORS policy" 에러

**해결**:
1. Render 환경 변수에서 `CLIENT_URL` 확인
2. Vercel URL과 정확히 일치하는지 확인
3. `https://` 포함 여부 확인

### 2. 500 Internal Server Error

**증상**: API 호출 시 500 에러

**해결**:
1. Render 대시보드 → Logs 탭 확인
2. 환경 변수 누락 확인 (특히 `DATABASE_URL`)
3. Supabase 연결 상태 확인

### 3. 로그인 안 됨

**증상**: 로그인 버튼 눌러도 반응 없음

**해결**:
1. 브라우저 개발자 도구 → Network 탭
2. API 요청 URL 확인
3. `REACT_APP_API_URL` 환경 변수 확인

### 4. Supabase 연결 끊김

**증상**: Database connection error

**해결**:
1. Render 환경 변수의 `DATABASE_URL` 확인
2. Supabase 대시보드에서 연결 문자열 다시 복사
3. 비밀번호에 특수문자 있으면 URL 인코딩 확인

---

## 📊 배포 상태 확인

### Backend (Render)
```
URL: https://jakupbanjang-api-xxxx.onrender.com
Status: https://dashboard.render.com
Logs: Dashboard → Logs 탭
```

### Frontend (Vercel)
```
URL: https://jakupbanjang-xxxx.vercel.app
Status: https://vercel.com/dashboard
Logs: Dashboard → Deployments → 최근 배포 클릭
```

### Database (Supabase)
```
Dashboard: https://supabase.com/dashboard
Status: Project → Settings → Database
```

---

## 🎯 요약

```
1. ✅ Backend → Render 배포 (환경 변수 설정)
2. ✅ Backend URL 복사
3. ✅ Frontend → Vercel 배포 (REACT_APP_API_URL 설정)
4. ✅ Frontend URL 복사
5. ✅ Render에 CLIENT_URL 업데이트
6. ✅ GitHub 푸시
7. ✅ 테스트!
```

---

## 🎉 완료!

**모든 설정이 완료되었습니다!**

Supabase 연동은 그대로 유지되며, Frontend와 Backend가 성공적으로 배포되었습니다!

**접속 URL:**
- Frontend: https://jakupbanjang-xxxx.vercel.app
- Backend API: https://jakupbanjang-api-xxxx.onrender.com

---

## 💡 다음 단계

1. 커스텀 도메인 연결 (선택)
2. HTTPS 강제 적용 (Vercel/Render 자동 지원)
3. 성능 모니터링 설정
4. 백업 전략 수립

**축하합니다! 🚀✨**

