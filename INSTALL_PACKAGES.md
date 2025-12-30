# 📦 패키지 설치 가이드

## 🚨 권한 문제 해결

현재 `node_modules` 폴더에 권한 문제가 있어서 패키지 설치가 필요합니다.

## 🔧 해결 방법 (아래 명령어를 터미널에서 실행하세요)

### 방법 1: 권한 수정 후 설치 (권장)

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
sudo chown -R $(whoami) node_modules
npm install @supabase/supabase-js nanoid
```

### 방법 2: node_modules 삭제 후 재설치

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
sudo rm -rf node_modules
npm install
```

## ✅ 설치 완료 후

설치가 완료되면 서버를 시작하세요:

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
npm run dev
```

또는

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
node index.js
```

## 🎉 성공 메시지

다음과 같은 메시지가 나오면 성공입니다:

```
✅ Database connection has been established successfully.
📦 Using Supabase PostgreSQL
🔧 Initializing Supabase Storage buckets...
✅ Bucket work-logs already exists
✅ Bucket expenses already exists
✅ Bucket attachments already exists
✅ Storage buckets initialized
🚀 Server is running on port 3001
📦 Environment: development
🔗 Database: Supabase PostgreSQL
📁 Storage: Supabase Storage
```

---

**참고**: sudo 비밀번호는 Mac 로그인 비밀번호입니다.

