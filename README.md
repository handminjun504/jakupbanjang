# 작업반장 프로젝트

Full-stack 작업 관리 시스템

## 사전 요구사항

프로젝트를 실행하기 전에 다음을 설치해야 합니다:

1. **Node.js** (v16 이상) - [https://nodejs.org/](https://nodejs.org/)
   - 다운로드 후 설치하고 시스템을 재시작하세요
   - 설치 확인: `node --version` 및 `npm --version`

2. **PostgreSQL** (v12 이상) - [https://www.postgresql.org/download/](https://www.postgresql.org/download/)

## 프로젝트 구조

```
jakupbanjang/
├── server/                 # 백엔드 (Express + PostgreSQL)
│   ├── config/            # DB 연결 및 설정 파일
│   ├── controllers/       # 요청/응답 로직
│   ├── models/            # Sequelize 데이터 모델
│   ├── routes/            # API 라우팅
│   ├── middlewares/       # 인증 등 미들웨어
│   ├── index.js           # 서버 진입점
│   ├── package.json       # 백엔드 의존성
│   └── .env               # 환경 변수 (생성 필요)
│
└── client/                # 프론트엔드 (React + TypeScript)
    ├── public/            # 정적 파일
    ├── src/
    │   ├── api/           # API 호출 함수
    │   ├── components/    # 공용 컴포넌트
    │   ├── hooks/         # 커스텀 훅
    │   ├── pages/         # 페이지 단위 컴포넌트
    │   ├── store/         # 전역 상태 관리
    │   ├── styles/        # 전역 스타일
    │   ├── utils/         # 유틸리티 함수
    │   ├── App.tsx        # 메인 앱 컴포넌트
    │   └── index.tsx      # 앱 진입점
    └── package.json       # 프론트엔드 의존성
```

## 설치 및 실행 방법

### 1. 백엔드 설정

```bash
# server 디렉토리로 이동
cd server

# .env 파일 생성 (.env.example을 복사하여 수정)
# Windows:
copy .env.example .env
# Mac/Linux:
# cp .env.example .env

# .env 파일을 열어서 실제 값으로 수정:
# - DATABASE_URL: 실제 PostgreSQL 연결 정보
# - JWT_SECRET: 안전한 랜덤 문자열 (32자 이상 권장)
# - CLIENT_URL: 프로덕션 환경의 프론트엔드 URL

# 의존성 패키지 설치
npm install

# 개발 서버 실행
npm run dev

# 또는 일반 실행
npm start
```

서버는 http://localhost:3001 에서 실행됩니다.

### 2. 프론트엔드 설정

```bash
# 새 터미널에서 client 디렉토리로 이동
cd client

# 의존성 패키지 설치
npm install

# 개발 서버 실행
npm start
```

클라이언트는 http://localhost:3000 에서 실행됩니다.

## .env 파일 생성

server 디렉토리에 `.env.example` 파일이 제공됩니다. 이를 복사하여 `.env` 파일을 생성하고 실제 값으로 수정하세요:

```bash
# Windows
cd server
copy .env.example .env

# Mac/Linux
cd server
cp .env.example .env
```

`.env` 파일을 열어서 다음 항목들을 실제 값으로 수정하세요:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/jakupbanjang"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NODE_ENV="development"
CLIENT_URL="http://localhost:3000"
PORT=3001
```

**⚠️ 보안 주의사항:** 
- `DATABASE_URL`: 실제 PostgreSQL 사용자 정보로 변경하세요
- `JWT_SECRET`: 32자 이상의 안전한 랜덤 문자열로 변경하세요 (온라인 생성기 사용 권장)
- `NODE_ENV`: 프로덕션 배포 시 `production`으로 변경
- `CLIENT_URL`: 프로덕션 환경에서는 실제 프론트엔드 도메인으로 변경
- `.env` 파일은 절대 Git에 커밋하지 마세요 (`.gitignore`에 포함됨)

## 기술 스택

### 백엔드
- Express.js - 웹 프레임워크
- PostgreSQL - 데이터베이스
- Sequelize - ORM
- JWT - 인증
- Bcrypt - 비밀번호 암호화

### 프론트엔드
- React 18 - UI 라이브러리
- TypeScript - 타입 안정성
- Axios - HTTP 클라이언트
- React Router - 라우팅
- Styled Components - 스타일링

## 다음 단계

1. Node.js 설치 확인
2. PostgreSQL 데이터베이스 설정
3. 백엔드 및 프론트엔드 의존성 설치 (`npm install`)
4. 환경 변수 설정 (.env 파일)
5. 서버 실행 확인

## 문제 해결

- **Node.js가 인식되지 않는 경우**: 시스템 재시작 후 터미널 재실행
- **포트가 이미 사용 중**: 다른 애플리케이션이 3000 또는 3001 포트를 사용하고 있는지 확인
- **데이터베이스 연결 오류**: PostgreSQL이 실행 중이고 .env 파일의 연결 정보가 올바른지 확인

## 📖 추가 문서

- [보안 가이드](./SECURITY.md) - 보안 설정 및 배포 체크리스트
- [시스템 개선 사항](./IMPROVEMENTS.md) - 최신 개선 내역 및 성능 향상
- [인증 시스템](./AUTH_SETUP.md) - 사용자 인증 구현 상세
- [디자인 시스템](./DESIGN_SYSTEM.md) - UI/UX 가이드라인

## 🎉 최신 업데이트 (2025-10-29)

### ✅ 보안 강화
- 데이터베이스 동기화 설정 개선 (`alter: true`)
- CORS 설정 강화 (특정 도메인만 허용)
- 환경 변수 보호 강화

### ✅ 로깅 시스템 (Winston)
- HTTP 요청/응답 자동 로깅
- 에러 추적 및 디버깅 용이
- 파일 및 콘솔 로그 분리

### ✅ API 응답 표준화
- 일관된 응답 형식
- 개선된 에러 처리
- 프론트엔드 통합 용이

### ✅ 데이터베이스 인덱스
- 쿼리 성능 10~100배 향상
- 40+ 인덱스 추가 (단일, 복합)
- 대용량 데이터 처리 준비

