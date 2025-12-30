# 🚀 지금 바로 Vercel 배포하기!

## ⚡ 빠른 시작 (5분!)

### 1️⃣ Backend 배포 (Render)

**👉 https://render.com 접속**

1. GitHub 계정으로 로그인
2. "New +" → "Web Service"
3. 저장소: `handminjun504/jakupbanjang` 선택
4. 아래 설정 입력:

```
Name: jakupbanjang-api
Region: Oregon (또는 Singapore)
Branch: main
Root Directory: server          ⭐
Environment: Node
Build Command: npm install
Start Command: node index.js
Instance Type: Free
```

5. **Environment Variables** 클릭해서 추가:

```bash
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.nkkmghnqupknpsxksmvi:cjdsusemfQW@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
SUPABASE_URL=https://nkkmghnqupknpsxksmvi.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra21naG5xdXBrbnBzeGtzbXZpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Njk5MjI1NSwiZXhwIjoyMDgyNTY4MjU1fQ.AQOLuu0Ivp58gkGAvV62MS6ppdrChdmFdHStiVmoqZo
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra21naG5xdXBrbnBzeGtzbXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTIyNTUsImV4cCI6MjA4MjU2ODI1NX0.Y7bSO-U6JXthRjNRMGR1vecvF_kH73EZKaHwJ9wOBvg
JWT_SECRET=jakupbanjang-super-secret-key-2025
ENCRYPTION_KEY=jakupbanjang-encryption-key-32chars!
CLIENT_URL=https://your-app.vercel.app
```

6. "Create Web Service" 클릭
7. ⏱️ 5분 대기
8. ✅ 완료! URL 복사: `https://jakupbanjang-api-xxxx.onrender.com`

---

### 2️⃣ Frontend 배포 (Vercel)

**👉 https://vercel.com 접속**

1. GitHub 계정으로 로그인
2. "Add New..." → "Project"
3. 저장소: `handminjun504/jakupbanjang` → "Import"
4. 아래 설정 입력:

```
Project Name: jakupbanjang
Framework: Create React App (자동)
Root Directory: client          ⭐
```

5. **Environment Variables** 추가:

| Name | Value |
|------|-------|
| `REACT_APP_API_URL` | `https://jakupbanjang-api-xxxx.onrender.com` |

⚠️ **위의 URL은 1단계에서 복사한 Render URL입니다!**

6. "Deploy" 클릭
7. ⏱️ 3분 대기
8. ✅ 완료! URL 복사: `https://jakupbanjang-xxxx.vercel.app`

---

### 3️⃣ Backend에 Frontend URL 등록

**👉 Render 대시보드로 돌아가기**

1. `jakupbanjang-api` 클릭
2. "Environment" 탭
3. `CLIENT_URL` 찾아서 수정:
   ```
   https://jakupbanjang-xxxx.vercel.app
   ```
4. "Save Changes"
5. ⏱️ 1분 대기 (자동 재시작)

---

### 4️⃣ 완료! 🎉

**이제 접속해보세요:**

```
https://jakupbanjang-xxxx.vercel.app
```

**회원가입하고 테스트!** ✨

---

## 📝 체크리스트

- [ ] Render에 Backend 배포 (환경 변수 10개 입력)
- [ ] Render에서 Backend URL 복사
- [ ] Vercel에 Frontend 배포 (REACT_APP_API_URL 입력)
- [ ] Vercel에서 Frontend URL 복사
- [ ] Render의 CLIENT_URL 업데이트
- [ ] 브라우저에서 접속 테스트!

---

## 🆘 문제 발생 시

**상세 가이드 참고:**
- `DEPLOYMENT_GUIDE.md` 파일 열기
- 문제 해결 섹션 확인

**Supabase 연결은 자동으로 유지됩니다!** ✅

---

**준비 완료! 지금 바로 배포하세요! 🚀**

