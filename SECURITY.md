# 보안 가이드

## 🛡️ 최근 보안 강화 내역

### 2025-01-07: 데이터 격리 보안 강화

**수정된 취약점:**
1. **현장 수정 API (`updateSite`)**: `companyId` 필터 추가
   - ❌ 이전: 관리자가 다른 회사의 현장을 수정할 수 있었음
   - ✅ 수정: 본인 회사의 현장만 수정 가능

2. **작업반장 할당 API (`assignForemenToSite`)**: 작업반장 소속 검증 추가
   - ❌ 이전: 다른 회사의 작업반장을 할당할 수 있었음
   - ✅ 수정: 본인 회사의 작업반장만 할당 가능

**보안 원칙:**
- 모든 API에서 `companyId` 필터링 강제
- 작업반장은 본인이 생성한 데이터만 조회/수정/삭제
- 관리자는 본인 회사의 모든 데이터 조회, 본인 회사 소속 사용자만 할당

---

## 🔒 중요한 보안 설정

### 1. 데이터베이스 동기화 설정

**현재 설정**: 개발 환경에서는 `{ alter: true }`를 사용하여 테이블 구조를 자동으로 업데이트하되, 기존 데이터는 보존합니다.

⚠️ **절대 금지**: `{ force: true }`는 모든 데이터를 삭제하므로 사용하지 마세요!

### 2. CORS (Cross-Origin Resource Sharing)

**현재 설정**: 
- 개발 환경: `http://localhost:3000`만 허용
- 프로덕션: `CLIENT_URL` 환경 변수에 설정된 도메인만 허용

프로덕션 배포 시 `.env` 파일에서 반드시 실제 도메인으로 변경하세요:
```env
CLIENT_URL="https://your-actual-domain.com"
```

### 3. 환경 변수 보호

**.env 파일 관리**:
- ✅ `.env` 파일은 `.gitignore`에 포함되어 Git에 업로드되지 않습니다
- ✅ `.env.example` 파일로 필요한 환경 변수 목록을 제공합니다
- ⚠️ `.env` 파일을 절대로 공개 저장소에 커밋하지 마세요
- ⚠️ JWT_SECRET은 32자 이상의 랜덤 문자열을 사용하세요

**JWT Secret 생성 방법**:
```bash
# Node.js로 안전한 랜덤 키 생성
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. 배포 전 체크리스트

프로덕션 환경에 배포하기 전에 다음 사항을 확인하세요:

- [ ] `NODE_ENV=production` 설정
- [ ] 안전한 `JWT_SECRET` 사용 (32자 이상)
- [ ] `CLIENT_URL`을 실제 프론트엔드 도메인으로 설정
- [ ] 데이터베이스 마이그레이션 준비
- [ ] HTTPS 사용 (SSL/TLS 인증서 설치)
- [ ] Rate limiting 설정 고려
- [ ] 로그 모니터링 시스템 구축

### 5. 데이터베이스 보안

- ✅ 주민등록번호는 bcrypt로 암호화하여 저장
- ✅ 중복 체크를 위한 SHA256 해시 별도 저장
- ⚠️ 데이터베이스 백업 정기적으로 수행
- ⚠️ 데이터베이스 접근 권한 최소화

### 6. 파일 업로드 보안

현재 Multer를 사용하여 파일 업로드를 처리하고 있습니다. 추가 보안 설정 권장:
- 파일 크기 제한
- 허용된 파일 확장자만 업로드 가능
- 파일 이름 sanitization
- 바이러스 스캔 (프로덕션 환경)

## 📚 추가 리소스

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

---

마지막 업데이트: 2025-10-29

