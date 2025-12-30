# 🔧 NPM 권한 오류 해결 방법

## 문제
```
EACCES: permission denied, mkdir '/Users/sonminjun/Downloads/jakupbanjang/server/node_modules'
```

`node_modules` 폴더에 권한 문제가 있어서 패키지 설치가 안 됩니다.

---

## ✅ 해결 방법

아래 명령어를 **터미널에서 순서대로** 실행하세요:

### 1단계: node_modules 삭제

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
sudo rm -rf node_modules package-lock.json
```

💡 **sudo 비밀번호**: Mac 로그인 비밀번호를 입력하세요

### 2단계: npm 캐시 정리 (선택사항)

```bash
npm cache clean --force
```

### 3단계: 패키지 재설치

```bash
npm install
```

---

## 🎯 전체 명령어 (한 번에 실행)

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server && \
sudo rm -rf node_modules package-lock.json && \
npm cache clean --force && \
npm install
```

---

## ✅ 설치 완료 확인

다음 명령어로 패키지가 제대로 설치되었는지 확인:

```bash
ls node_modules/@supabase/supabase-js
```

**"supabase-js"가 보이면 성공!** ✅

---

## 🚀 서버 시작

설치 완료 후 서버를 시작하세요:

```bash
npm run dev
```

또는

```bash
node index.js
```

---

## 🎉 성공 메시지

서버가 정상적으로 시작되면:

```
✅ Database connection has been established successfully.
📦 Using Supabase PostgreSQL
🔧 Initializing Supabase Storage buckets...
✅ Bucket work-logs created successfully
✅ Bucket expenses created successfully
✅ Bucket attachments created successfully
✅ Storage buckets initialized
🚀 Server is running on port 3001
```

---

## 🆘 여전히 안 된다면?

### 방법 1: server 폴더 권한 변경
```bash
cd /Users/sonminjun/Downloads/jakupbanjang
sudo chown -R $(whoami) server
cd server
npm install
```

### 방법 2: 전체 프로젝트 권한 변경
```bash
cd /Users/sonminjun/Downloads
sudo chown -R $(whoami) jakupbanjang
cd jakupbanjang/server
npm install
```

---

**마지막 업데이트**: 2025-12-29

