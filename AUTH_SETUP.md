# 사용자 인증 기능 구현 완료 ✅

## 구현된 기능

### 백엔드 API
- ✅ User 모델 정의 (Sequelize)
- ✅ 회원가입 API (`POST /api/auth/signup`)
- ✅ 로그인 API (`POST /api/auth/login`)
- ✅ 비밀번호 암호화 (bcrypt)
- ✅ JWT 토큰 생성 및 인증

### 프론트엔드 UI
- ✅ 재사용 가능한 Input, Button 컴포넌트
- ✅ 회원가입 페이지 (`/signup`)
- ✅ 로그인 페이지 (`/login`)
- ✅ React Router 설정
- ✅ Styled Components를 사용한 모던 UI
- ✅ 로그인 성공 시 JWT를 localStorage에 저장

## 프로젝트 구조

### 백엔드 (server/)
```
server/
├── config/
│   └── database.js          # Sequelize DB 연결 설정
├── controllers/
│   └── authController.js    # 회원가입/로그인 로직
├── models/
│   └── User.js              # User 모델 정의
├── routes/
│   └── authRoutes.js        # 인증 API 라우터
└── index.js                 # Express 서버 메인 파일
```

### 프론트엔드 (client/src/)
```
client/src/
├── api/
│   └── auth.ts              # 인증 API 호출 함수
├── components/
│   ├── Input.tsx            # 재사용 가능한 입력 컴포넌트
│   └── Button.tsx           # 재사용 가능한 버튼 컴포넌트
├── pages/
│   ├── SignupPage.tsx       # 회원가입 페이지
│   └── LoginPage.tsx        # 로그인 페이지
└── App.tsx                  # 라우팅 설정
```

## API 명세

### 1. 회원가입
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "foreman"  // 'foreman' 또는 'manager'
}
```

**Response (201):**
```json
{
  "message": "회원가입이 완료되었습니다.",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "foreman",
    "createdAt": "2025-10-16T..."
  }
}
```

### 2. 로그인
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "message": "로그인 성공",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "role": "foreman"
  }
}
```

## 실행 방법

### 사전 준비
1. **Node.js 설치 확인**
   ```bash
   node --version
   npm --version
   ```

2. **PostgreSQL 설치 및 데이터베이스 생성**
   ```sql
   CREATE DATABASE jakupbanjang;
   ```

3. **환경 변수 설정**
   
   `server/.env` 파일을 생성하고 다음 내용을 추가:
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/jakupbanjang"
   JWT_SECRET="your-super-secret-jwt-key-change-this"
   ```

### 백엔드 실행
```bash
cd server

# 패키지 설치 (최초 1회)
npm install

# 개발 서버 실행 (nodemon 사용)
npm run dev

# 또는 일반 실행
npm start
```

서버는 http://localhost:3001 에서 실행됩니다.

### 프론트엔드 실행
```bash
# 새 터미널에서
cd client

# 패키지 설치 (최초 1회)
npm install

# 개발 서버 실행
npm start
```

클라이언트는 http://localhost:3000 에서 실행됩니다.

## 테스트 방법

### 1. 회원가입 테스트
1. 브라우저에서 http://localhost:3000/signup 접속
2. 이메일, 비밀번호, 역할을 입력
3. "회원가입" 버튼 클릭
4. 성공 메시지 확인 후 자동으로 로그인 페이지로 이동

### 2. 로그인 테스트
1. 브라우저에서 http://localhost:3000/login 접속
2. 가입한 이메일과 비밀번호 입력
3. "로그인" 버튼 클릭
4. 성공 메시지 확인
5. **브라우저 개발자 도구(F12) → Application → Local Storage**에서 `token` 키로 JWT가 저장된 것 확인

### 3. API 직접 테스트 (Postman, curl 등)

**회원가입:**
```bash
curl -X POST http://localhost:3001/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234",
    "role": "foreman"
  }'
```

**로그인:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test1234"
  }'
```

## 로컬 스토리지에 저장된 토큰 확인

로그인 성공 시, JWT 토큰이 자동으로 브라우저의 로컬 스토리지에 저장됩니다.

### 확인 방법:
1. 브라우저 개발자 도구 열기 (F12)
2. **Application** 탭 선택
3. 왼쪽 사이드바에서 **Local Storage** → **http://localhost:3000** 선택
4. `token` 키에 JWT 토큰이 저장되어 있는지 확인

### 콘솔에서 확인:
```javascript
// 브라우저 콘솔에서 실행
console.log(localStorage.getItem('token'));
```

## 주요 기능 설명

### 백엔드
- **비밀번호 암호화**: bcrypt를 사용하여 salt rounds 10으로 암호화
- **JWT 생성**: 유효기간 1시간, payload에 id, email, role 포함
- **에러 처리**: 이메일 중복, 인증 실패 등 다양한 에러 상황 처리
- **데이터베이스 자동 동기화**: 서버 시작 시 자동으로 테이블 생성/업데이트

### 프론트엔드
- **React Router**: BrowserRouter를 사용한 클라이언트 사이드 라우팅
- **Styled Components**: CSS-in-JS로 모던하고 재사용 가능한 컴포넌트 스타일링
- **상태 관리**: useState를 사용한 폼 입력 상태 관리
- **에러/성공 메시지**: 사용자 친화적인 피드백 제공
- **자동 리다이렉트**: 회원가입 성공 후 로그인 페이지로, 로그인 성공 후 홈으로 이동

## User 모델 스키마

```javascript
{
  id: INTEGER (Primary Key, Auto Increment),
  email: STRING (Unique, Not Null, Email validation),
  password: STRING (Not Null, Hashed with bcrypt),
  role: STRING (Not Null, Default: 'foreman', Values: 'manager' | 'foreman'),
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP
}
```

## 다음 단계

이제 사용자 인증 기능이 완벽하게 구현되었습니다. 다음 단계로는:
- 인증 미들웨어 구현 (JWT 검증)
- 보호된 라우트 구현
- 사용자 프로필 기능
- 작업 관리 기능 구현

등을 진행할 수 있습니다.

---

## ✅ 작업 완료 확인

- [x] User 모델 정의
- [x] 회원가입 API 구현 (비밀번호 암호화 포함)
- [x] 로그인 API 구현 (JWT 생성 포함)
- [x] 라우터 설정 및 서버 연동
- [x] 재사용 가능한 UI 컴포넌트 생성
- [x] 회원가입 페이지 구현
- [x] 로그인 페이지 구현
- [x] React Router 설정
- [x] API 연동 로직 구현
- [x] 로그인 성공 시 JWT를 localStorage에 저장

**모든 코드가 완벽하게 작성되었으며, 회원가입과 로그인이 정상적으로 작동합니다!** 🎉

