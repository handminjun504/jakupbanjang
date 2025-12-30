# 🚀 빠른 시작 가이드

## 1️⃣ 패키지 설치

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
npm install @supabase/supabase-js nanoid
```

## 2️⃣ 환경 변수 설정

`server/.env` 파일을 열고 다음 3가지만 수정:

### ✏️ 수정 필요한 항목:

1. **DATABASE_URL** - Supabase 비밀번호
   ```
   DATABASE_URL="postgresql://postgres:[여기에-비밀번호]@db.nkkmghnqupknpsxksmvi.supabase.co:5432/postgres"
   ```

2. **SUPABASE_SERVICE_ROLE_KEY** - Supabase Dashboard에서 복사
   ```
   SUPABASE_SERVICE_ROLE_KEY="[여기에-service-role-키]"
   ```

3. **JWT_SECRET** - 랜덤 문자열 (32자 이상)
   ```
   JWT_SECRET="여기에-랜덤-문자열-32자-이상"
   ```

### 📍 Supabase 정보 확인 방법:

**비밀번호:**
- Supabase Dashboard → Settings → Database → Connection String

**Service Role Key:**
- Supabase Dashboard → Settings → API → service_role (눈 아이콘 클릭)

## 3️⃣ 서버 시작

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
npm run dev
```

## ✅ 성공 확인

다음 메시지가 보이면 성공:
```
✅ Database connection has been established successfully.
📦 Using Supabase PostgreSQL
✅ Storage buckets initialized
🚀 Server is running on port 3001
```

## 🎉 완료!

이제 다음을 사용할 수 있습니다:
- ✅ Supabase PostgreSQL 데이터베이스
- ✅ Supabase Storage 파일 업로드
- ✅ 모든 기존 기능

---

**문제가 있나요?** → `SUPABASE_MIGRATION_GUIDE.md` 참고
