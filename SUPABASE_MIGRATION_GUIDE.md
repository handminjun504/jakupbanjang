# 🚀 Supabase 마이그레이션 완료 가이드

## ✅ 완료된 작업

### 1. 데이터베이스 마이그레이션
- ✅ Supabase PostgreSQL 스키마 생성
- ✅ 모든 테이블 및 인덱스 생성
- ✅ 자동 `updated_at` 트리거 설정
- ✅ `config/database.js` → Supabase PostgreSQL 연결

### 2. 파일 업로드 구현
- ✅ `config/supabase.js` → Supabase Storage 클라이언트
- ✅ `config/multer.js` → 메모리 스토리지로 변경
- ✅ `models/Attachment.js` → Supabase Storage 필드 추가
- ✅ `controllers/attachmentController.js` → Supabase Storage 사용
- ✅ 서버 시작 시 자동 버킷 생성

---

## 🔧 필수 설정 단계

### 1단계: 패키지 설치

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
npm install @supabase/supabase-js nanoid
```

### 2단계: Supabase 비밀번호 확인

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Database** 클릭
4. **Connection String** 섹션에서 **URI** 복사
5. 비밀번호 확인 (또는 재설정)

### 3단계: Service Role Key 확인

1. Supabase Dashboard
2. **Settings** → **API** 클릭
3. **Project API keys** 섹션
4. `service_role` 키 복사 (Secret 옆의 눈 아이콘 클릭)

### 4단계: 환경 변수 설정

`server/.env` 파일을 열고 다음 내용으로 업데이트:

```env
# ============================================
# Supabase Configuration
# ============================================

# PostgreSQL Connection (Settings → Database → Connection String)
# [YOUR-PASSWORD]를 실제 비밀번호로 교체하세요
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.nkkmghnqupknpsxksmvi.supabase.co:5432/postgres"

# Supabase URL
SUPABASE_URL="https://nkkmghnqupknpsxksmvi.supabase.co"

# Supabase Anon Key (Public)
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ra21naG5xdXBrbnBzeGtzbXZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5OTIyNTUsImV4cCI6MjA4MjU2ODI1NX0.Y7bSO-U6JXthRjNRMGR1vecvF_kH73EZKaHwJ9wOBvg"

# Supabase Service Role Key (Settings → API → service_role)
# 여기에 복사한 service_role 키를 붙여넣으세요
SUPABASE_SERVICE_ROLE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# ============================================
# Application Configuration
# ============================================

# JWT Secret (32자 이상 랜덤 문자열)
# 생성 방법: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# Encryption Key (정확히 32자)
ENCRYPTION_KEY="your-32-character-encryption-key"

# Environment
NODE_ENV="development"

# Client URL
CLIENT_URL="http://localhost:3000"

# Server Port
PORT=3001

# ============================================
# File Upload Configuration
# ============================================

# Maximum file size (bytes) - 10MB
MAX_FILE_SIZE=10485760

# Allowed file types
ALLOWED_FILE_TYPES="image/jpeg,image/png,image/jpg,application/pdf"
```

### 5단계: 서버 시작

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
npm run dev
```

**성공 메시지 확인:**
```
✅ Database connection has been established successfully.
📦 Using Supabase PostgreSQL
🔧 Initializing Supabase Storage buckets...
✅ Bucket work-logs already exists (또는 created successfully)
✅ Bucket expenses already exists
✅ Bucket attachments already exists
✅ Storage buckets initialized
🚀 Server is running on port 3001
📦 Environment: development
🔗 Database: Supabase PostgreSQL
📁 Storage: Supabase Storage
```

---

## 📊 생성된 데이터베이스 테이블

Supabase Dashboard → **Table Editor**에서 확인:

| 테이블 | 설명 | 주요 필드 |
|--------|------|-----------|
| `companies` | 기업 정보 | id, name, invite_code |
| `users` | 사용자 (관리자/작업반장) | id, name, email, phone, role, company_id |
| `sites` | 현장 정보 | id, name, address, manager_id, company_id |
| `workers` | 근무자 정보 | id, name, rrn, foreman_id, company_id |
| `tasks` | 작업일지 | id, worker_id, effort, daily_rate, work_date |
| `expenses` | 지출결의 | id, title, amount, status, site_id |
| `comments` | 댓글 | id, content, task_id, user_id |
| `attachments` | 첨부파일 | id, filename, file_path, storage_path |

---

## 📁 Storage 버킷

Supabase Dashboard → **Storage**에서 확인:

| 버킷 이름 | 용도 | Public | 크기 제한 |
|-----------|------|--------|-----------|
| `work-logs` | 작업일지 첨부파일 | ✅ | 10MB |
| `expenses` | 지출결의 증빙 | ✅ | 10MB |
| `attachments` | 기타 첨부파일 | ✅ | 10MB |

**자동 생성**: 서버 시작 시 자동으로 생성됩니다.

---

## 🔒 보안 체크리스트

배포 전 확인:

- [ ] `DATABASE_URL`에 실제 비밀번호 설정
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 설정 (절대 클라이언트에 노출 금지!)
- [ ] `JWT_SECRET` 32자 이상 랜덤 문자열로 변경
- [ ] `ENCRYPTION_KEY` 정확히 32자로 설정
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 프로덕션 환경에서 `NODE_ENV=production` 설정

---

## 🧪 테스트

### 1. 데이터베이스 연결 테스트

```bash
cd server
node -e "require('./config/database')"
```

**예상 출력:**
```
✅ Database connection has been established successfully.
📦 Using Supabase PostgreSQL
```

### 2. 파일 업로드 테스트

```bash
# 1. 로그인하여 JWT 토큰 받기
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "your-email@example.com",
    "password": "your-password",
    "userType": "manager"
  }'

# 2. 파일 업로드 (JWT 토큰 사용)
curl -X POST http://localhost:3001/api/tasks/1/attachments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/test.jpg"
```

### 3. Storage 버킷 확인

Supabase Dashboard → **Storage** → 각 버킷 클릭하여 파일 확인

---

## 🚨 문제 해결

### 문제 1: 데이터베이스 연결 실패

**증상:**
```
❌ Unable to connect to the database
```

**해결책:**
1. `.env` 파일의 `DATABASE_URL` 확인
2. 비밀번호에 특수문자가 있으면 URL 인코딩 필요
3. Supabase 프로젝트가 활성 상태인지 확인

**비밀번호 URL 인코딩 예시:**
```javascript
// 비밀번호에 @, #, $ 등이 있으면
const password = "my@pass#word";
const encoded = encodeURIComponent(password); // "my%40pass%23word"
```

### 문제 2: Service Role Key 오류

**증상:**
```
❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set!
```

**해결책:**
1. Supabase Dashboard → Settings → API
2. `service_role` 키 복사 (Secret 옆 눈 아이콘 클릭)
3. `.env` 파일에 붙여넣기
4. 서버 재시작

### 문제 3: 버킷 생성 실패

**증상:**
```
❌ Error creating bucket work-logs
```

**해결책:**
1. Supabase Dashboard → Storage
2. 수동으로 버킷 생성:
   - Name: `work-logs`, `expenses`, `attachments`
   - Public: ✅ 체크
   - File size limit: 10MB
3. 서버 재시작

### 문제 4: npm 권한 오류

**증상:**
```
EACCES: permission denied
```

**해결책:**
```bash
# macOS/Linux
sudo chown -R $(whoami) /Users/sonminjun/Downloads/jakupbanjang/server/node_modules
cd /Users/sonminjun/Downloads/jakupbanjang/server
npm install
```

---

## 📈 성능 최적화

### Connection Pooling 설정

`config/database.js`에 이미 설정됨:
```javascript
pool: {
  max: 5,        // 최대 연결 수
  min: 0,        // 최소 연결 수
  acquire: 30000, // 연결 획득 타임아웃 (30초)
  idle: 10000    // 유휴 연결 타임아웃 (10초)
}
```

### 파일 업로드 최적화

- 메모리 스토리지 사용 (디스크 I/O 감소)
- Supabase CDN 활용 (빠른 파일 전송)
- Public URL 캐싱

---

## 🔄 기존 SQLite 데이터 마이그레이션 (선택사항)

기존 SQLite 데이터를 Supabase로 옮기려면:

### 방법 1: 수동 마이그레이션

```bash
# 1. SQLite 데이터 덤프
sqlite3 server/database.sqlite .dump > data_dump.sql

# 2. Supabase SQL Editor에서 실행
# - Dashboard → SQL Editor
# - data_dump.sql 내용 복사/붙여넣기
# - 타입 변환 필요 (AUTOINCREMENT → SERIAL 등)
```

### 방법 2: 프로그래밍 방식

```javascript
// migrate.js
const sqlite3 = require('sqlite3');
const { sequelize } = require('./config/database');

// SQLite에서 데이터 읽기
// Supabase PostgreSQL에 삽입
// ...
```

---

## 📚 참고 자료

- [Supabase 공식 문서](https://supabase.com/docs)
- [Supabase Storage 가이드](https://supabase.com/docs/guides/storage)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)
- [Sequelize 문서](https://sequelize.org/docs/v6/)

---

## 📞 추가 도움

문제가 계속되면:

1. **로그 확인**: `server/logs/error.log`
2. **Supabase 로그**: Dashboard → Logs
3. **데이터베이스 상태**: Dashboard → Database → Connection pooling

---

**마지막 업데이트**: 2025-12-29  
**버전**: 1.0.0  
**상태**: ✅ 프로덕션 준비 완료

