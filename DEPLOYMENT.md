# 🚀 배포 가이드

## 목차
- [사전 요구사항](#사전-요구사항)
- [환경 변수 설정](#환경-변수-설정)
- [Docker 배포](#docker-배포)
- [PM2 배포](#pm2-배포)
- [데이터베이스 마이그레이션](#데이터베이스-마이그레이션)
- [백업 및 복구](#백업-및-복구)
- [모니터링](#모니터링)
- [롤백 전략](#롤백-전략)
- [트러블슈팅](#트러블슈팅)

---

## 사전 요구사항

### 소프트웨어
- Node.js 18+ 또는 20+
- Docker & Docker Compose (Docker 배포 시)
- PostgreSQL 15+ (직접 설치 시)
- PM2 (프로세스 관리)
- Nginx (리버스 프록시, SSL)

### 서버 스펙 권장사항
- **최소**: 2 vCPU, 4GB RAM, 40GB SSD
- **권장**: 4 vCPU, 8GB RAM, 100GB SSD
- **대규모**: 8+ vCPU, 16GB+ RAM, 200GB+ SSD

---

## 환경 변수 설정

### Backend (.env)
```bash
# 프로덕션 환경 변수
NODE_ENV=production
PORT=3001

# 데이터베이스 (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/jakupbanjang

# JWT 보안
JWT_SECRET=<32자 이상 랜덤 문자열>
# 생성: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 주민번호 암호화 (AES-256)
ENCRYPTION_KEY=<Base64 인코딩된 32바이트 키>
# 생성: node -e "console.log(Buffer.from(require('crypto').randomBytes(32)).toString('base64'))"

# CORS
CLIENT_URL=https://yourdomain.com

# Redis (선택사항)
REDIS_URL=redis://localhost:6379
```

### Frontend (.env.production)
```bash
REACT_APP_API_URL=https://api.yourdomain.com
```

---

## Docker 배포

### 1단계: 이미지 빌드
```bash
# 전체 스택 빌드 및 실행
docker-compose up -d --build

# 또는 개별 빌드
docker build -t jakup-backend:latest ./server
docker build -t jakup-frontend:latest ./client
```

### 2단계: 컨테이너 실행
```bash
# 모든 서비스 시작
docker-compose up -d

# 특정 서비스만 재시작
docker-compose restart backend

# 로그 확인
docker-compose logs -f backend
docker-compose logs -f frontend

# 상태 확인
docker-compose ps
```

### 3단계: 헬스체크
```bash
# Backend 헬스체크
curl http://localhost:3001/health

# Frontend 헬스체크
curl http://localhost/
```

### Docker Compose 명령어
```bash
# 시작
docker-compose up -d

# 중지
docker-compose stop

# 재시작
docker-compose restart

# 삭제 (데이터 유지)
docker-compose down

# 완전 삭제 (볼륨 포함)
docker-compose down -v

# 로그
docker-compose logs -f [service_name]

# 실행 중인 컨테이너 접속
docker-compose exec backend sh
```

---

## PM2 배포

### 1단계: PM2 설치
```bash
npm install -g pm2
```

### 2단계: 애플리케이션 시작
```bash
cd server

# 프로덕션 모드로 시작
pm2 start ecosystem.config.js --env production

# 또는 npm 스크립트 사용
npm run pm2:start
```

### 3단계: PM2 관리 명령어
```bash
# 상태 확인
pm2 status
pm2 list

# 실시간 모니터링
pm2 monit

# 로그 확인
pm2 logs jakup-backend
pm2 logs jakup-backend --lines 100

# 재시작
pm2 restart jakup-backend

# 중지
pm2 stop jakup-backend

# 삭제
pm2 delete jakup-backend

# 재로드 (무중단)
pm2 reload jakup-backend

# 시스템 부팅 시 자동 시작
pm2 startup
pm2 save
```

### PM2 클러스터 모드 (다중 프로세스)
```javascript
// ecosystem.config.js에서 설정됨
instances: 'max',  // CPU 코어 수만큼 프로세스 생성
exec_mode: 'cluster'
```

---

## 데이터베이스 마이그레이션

### 수동 마이그레이션
```bash
# 서버 시작 시 자동으로 sync 실행됨 (개발 환경)
# 프로덕션에서는 alter: false 설정

# 마이그레이션 파일 생성
npx sequelize-cli migration:generate --name add-new-field

# 마이그레이션 실행
npx sequelize-cli db:migrate

# 마이그레이션 롤백
npx sequelize-cli db:migrate:undo
```

---

## 백업 및 복구

### 자동 백업 설정 (Cron)
```bash
# Cron 편집
crontab -e

# 매일 새벽 3시에 자동 백업
0 3 * * * /path/to/jakupbanjang/server/scripts/backup-database.sh

# 매주 일요일 새벽 2시에 주간 백업
0 2 * * 0 /path/to/jakupbanjang/server/scripts/backup-database.sh
```

### 수동 백업
```bash
cd server/scripts

# 백업 실행
chmod +x backup-database.sh
./backup-database.sh

# 백업 파일 확인
ls -lh ../backups/
```

### 데이터베이스 복구
```bash
cd server/scripts

# 복구 실행
chmod +x restore-database.sh
./restore-database.sh /path/to/backup.sql.gz

# 또는 최신 백업으로 복구
./restore-database.sh $(ls -t ../backups/*.sql.gz | head -n 1)
```

### 클라우드 백업 (AWS S3 예시)
```bash
# S3에 백업 업로드
aws s3 cp /app/backups/jakupbanjang_20251030_030000.sql.gz \
  s3://your-bucket/backups/

# S3에서 백업 다운로드
aws s3 cp s3://your-bucket/backups/jakupbanjang_20251030_030000.sql.gz \
  /app/backups/
```

---

## 모니터링

### 헬스체크 엔드포인트
```bash
# 서버 상태 확인
curl http://localhost:3001/health

# 응답 예시
{
  "status": "healthy",
  "timestamp": "2025-10-30T10:30:00.000Z",
  "uptime": "24h 15m 30s",
  "environment": "production",
  "database": "connected",
  "memory": {
    "rss": 150,
    "heapTotal": 80,
    "heapUsed": 60,
    "external": 10
  }
}
```

### PM2 웹 대시보드
```bash
# PM2 Plus 설치
pm2 install pm2-server-monit

# 웹 모니터링 링크 생성
pm2 link <secret_key> <public_key>
```

### Nginx 설정 (리버스 프록시 + SSL)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Frontend
    location / {
        proxy_pass http://localhost;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001/health;
        access_log off;
    }
}
```

---

## 롤백 전략

### 애플리케이션 롤백
```bash
# Docker 이미지 태그 사용
docker-compose down
docker tag jakup-backend:previous jakup-backend:latest
docker-compose up -d

# PM2 롤백 (이전 버전 코드로 교체 후)
pm2 restart jakup-backend
```

### 데이터베이스 롤백
```bash
# 백업에서 복구
./scripts/restore-database.sh /app/backups/jakupbanjang_YYYYMMDD_HHMMSS.sql.gz
```

### 무중단 배포 (Blue-Green)
```bash
# 1. 새 버전 배포 (Green)
docker-compose -f docker-compose.green.yml up -d

# 2. 헬스체크 확인
curl http://localhost:3002/health

# 3. Nginx 트래픽 전환
# (Green으로 트래픽 라우팅)

# 4. 기존 버전 종료 (Blue)
docker-compose -f docker-compose.blue.yml down
```

---

## 트러블슈팅

### 서버가 시작되지 않음
```bash
# 1. 포트 충돌 확인
lsof -i :3001

# 2. 환경 변수 확인
cat .env

# 3. 로그 확인
pm2 logs jakup-backend --lines 100
docker-compose logs -f backend

# 4. 데이터베이스 연결 확인
psql -h localhost -U jakup -d jakupbanjang
```

### 데이터베이스 연결 실패
```bash
# PostgreSQL 상태 확인
systemctl status postgresql

# 연결 테스트
psql -h localhost -U jakup -d jakupbanjang -c "SELECT 1;"

# 연결 설정 확인
cat /etc/postgresql/15/main/pg_hba.conf
```

### 메모리 부족
```bash
# 메모리 사용량 확인
free -h
docker stats

# PM2 메모리 제한 설정 (ecosystem.config.js)
max_memory_restart: '500M'

# Node.js 메모리 제한
node --max-old-space-size=4096 index.js
```

### 디스크 용량 부족
```bash
# 디스크 사용량 확인
df -h

# Docker 정리
docker system prune -a --volumes

# 로그 파일 정리
find ./logs -name "*.log" -mtime +30 -delete

# 오래된 백업 삭제 (30일 이상)
find ./backups -name "*.gz" -mtime +30 -delete
```

---

## 체크리스트

### 배포 전
- [ ] 환경 변수 (.env) 설정 완료
- [ ] JWT_SECRET 변경
- [ ] ENCRYPTION_KEY 변경
- [ ] 데이터베이스 백업 완료
- [ ] 테스트 코드 실행 (`npm test`)
- [ ] SSL 인증서 설정 (Let's Encrypt)
- [ ] Firewall 설정

### 배포 후
- [ ] 헬스체크 확인 (`/health`)
- [ ] API 엔드포인트 테스트
- [ ] 로그 모니터링
- [ ] 자동 백업 Cron 설정
- [ ] PM2 자동 시작 설정
- [ ] 성능 모니터링 설정

---

## 참고 자료
- [Docker 공식 문서](https://docs.docker.com/)
- [PM2 공식 문서](https://pm2.keymetrics.io/docs/)
- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Nginx 공식 문서](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

---

마지막 업데이트: 2025-10-30

