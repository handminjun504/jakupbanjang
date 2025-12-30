# 🔧 데이터베이스 연결 오류 해결

## 문제
```
❌ Tenant or user not found
```

DATABASE_URL의 연결 정보가 잘못되었습니다.

---

## ✅ 해결 방법

### 1단계: Supabase 연결 정보 확인

1. [Supabase Dashboard](https://supabase.com/dashboard) 접속
2. 프로젝트 선택
3. **Settings** → **Database** 클릭
4. **Connection String** 섹션 찾기

### 2단계: 올바른 연결 문자열 선택

**두 가지 옵션이 있습니다:**

#### 옵션 A: Transaction Mode (권장) - Port 5432
```
URI 탭 선택 → Transaction 모드
```

예시:
```
postgresql://postgres.[project-ref]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres
```

#### 옵션 B: Direct Connection (더 안정적) - Port 6543
```
URI 탭 선택 → Session 모드
```

예시:
```
postgresql://postgres.nkkmghnqupknpsxksmvi:[password]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 3단계: 비밀번호 확인

**중요**: 비밀번호를 정확히 복사하세요!

- 특수문자가 있으면 URL 인코딩 필요
- 또는 Supabase에서 비밀번호 재설정

**비밀번호 재설정 방법:**
1. Settings → Database
2. **Reset Database Password** 버튼 클릭
3. 새 비밀번호 생성 (특수문자 없이!)
4. 복사하여 저장

### 4단계: .env 파일 수정

`server/.env` 파일을 열고 `DATABASE_URL`을 수정:

```env
# Direct connection (권장)
DATABASE_URL="postgresql://postgres.nkkmghnqupknpsxksmvi:[새-비밀번호]@db.nkkmghnqupknpsxksmvi.supabase.co:5432/postgres"
```

**또는**

```env
# Pooler connection
DATABASE_URL="postgresql://postgres.nkkmghnqupknpsxksmvi:[새-비밀번호]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"
```

### 5단계: 특수문자 처리

비밀번호에 특수문자가 있으면 URL 인코딩:

**터미널에서 실행:**
```bash
node -e "console.log('Encoded:', encodeURIComponent('여기에-비밀번호'))"
```

---

## 🎯 간단한 해결책 (권장)

### Supabase에서 간단한 비밀번호로 재설정

1. **Settings** → **Database** → **Reset Database Password**
2. 특수문자 없이 간단한 비밀번호 생성 (예: `MyPassword123`)
3. `.env` 파일 수정:

```env
DATABASE_URL="postgresql://postgres.nkkmghnqupknpsxksmvi:MyPassword123@db.nkkmghnqupknpsxksmvi.supabase.co:5432/postgres"
```

---

## 🚀 테스트

`.env` 수정 후 서버 시작:

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
node index.js
```

---

## 🎉 성공 메시지

```
✅ Database connection has been established successfully.
📦 Using Supabase PostgreSQL
```

---

**마지막 업데이트**: 2025-12-29

