# 🔍 올바른 DATABASE_URL 가져오기

## 문제
호스트를 찾을 수 없습니다. 정확한 연결 문자열이 필요합니다.

---

## ✅ 해결 방법

### 1단계: Supabase Dashboard에서 연결 문자열 복사

1. [Supabase Dashboard](https://supabase.com/dashboard/project/nkkmghnqupknpsxksmvi) 접속
2. **Settings** (왼쪽 하단 톱니바퀴 아이콘) 클릭
3. **Database** 클릭
4. 아래로 스크롤하여 **Connection String** 섹션 찾기

### 2단계: URI 복사

**Connection String** 섹션에서:

1. **URI** 탭 선택
2. **Session mode** 또는 **Transaction mode** 선택
3. 연결 문자열 복사 (클릭하면 자동 복사됨)

**예시 (이런 형식이어야 함):**
```
postgresql://postgres.nkkmghnqupknpsxksmvi:[YOUR-PASSWORD]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

또는

```
postgresql://postgres:[YOUR-PASSWORD]@db.nkkmghnqupknpsxksmvi.supabase.co:5432/postgres
```

### 3단계: 비밀번호 교체

복사한 문자열에서 `[YOUR-PASSWORD]` 부분을 새 비밀번호로 교체:

```
cjdsusemfQW
```

**최종 결과 예시:**
```
postgresql://postgres.nkkmghnqupknpsxksmvi:cjdsusemfQW@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres
```

### 4단계: .env 파일 수정

`server/.env` 파일을 열고 `DATABASE_URL`을 업데이트:

```env
DATABASE_URL="복사한-연결문자열-여기에-붙여넣기"
```

---

## 🎯 빠른 가이드

**터미널에서 실행:**

```bash
cd /Users/sonminjun/Downloads/jakupbanjang/server
nano .env
```

**또는 VS Code/Cursor에서:**
- `server/.env` 파일 열기
- `DATABASE_URL` 줄 수정
- 저장 (⌘+S)

---

## 📋 체크리스트

복사한 연결 문자열 확인:

- [ ] `postgresql://`로 시작하는가?
- [ ] 프로젝트 ID `nkkmghnqupknpsxksmvi`가 포함되어 있는가?
- [ ] 비밀번호 `cjdsusemfQW`로 교체했는가?
- [ ] 포트 번호가 있는가? (`:5432` 또는 `:6543`)

---

## 🚀 수정 후

서버 재시작:

```bash
node index.js
```

---

**Supabase Dashboard에서 정확한 연결 문자열을 복사한 후 알려주세요!** 📋

