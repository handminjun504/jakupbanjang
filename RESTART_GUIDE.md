# 🔄 서버 재시작 가이드

## 🚀 다음에 다시 시작하려면

### 1️⃣ Backend (서버) 시작

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
npm run dev
```

또는

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
node index.js
```

**예상 출력:**
```
✅ Database connection has been established successfully.
📦 Using Supabase PostgreSQL
✅ Storage buckets initialized
🚀 Server is running on port 3001
```

---

### 2️⃣ Frontend (클라이언트) 시작

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/client
npm start
```

**예상 출력:**
```
Compiled successfully!
You can now view client in the browser.
  Local:            http://localhost:3000
```

---

### 3️⃣ 브라우저 접속

```
http://localhost:3000
```

---

## 🔧 한 번에 시작하기 (터미널 2개 필요)

### 터미널 1 - Backend
```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server && npm run dev
```

### 터미널 2 - Frontend
```bash
cd /Users/sonminjun/Downloads/jakupbanjang/client && npm start
```

---

## 📊 환경 변수 확인

서버가 시작되지 않으면 `.env` 파일 확인:

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
cat .env | grep DATABASE_URL
```

---

## 🆘 문제 해결

### Backend가 시작 안 되면
```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'OK' : 'MISSING')"
```

### Frontend가 시작 안 되면
```bash
cd /Users/sonminjun/Downloads/jakupbanjang/client
npm install
npm start
```

### 포트 충돌 시
```bash
# 포트 3001 정리
lsof -ti:3001 | xargs kill -9

# 포트 3000 정리
lsof -ti:3000 | xargs kill -9
```

---

## ✅ 완료!

모든 서버가 종료되었습니다. 수고하셨습니다! 🎉

**다음에 다시 시작할 때 이 가이드를 참고하세요!**

