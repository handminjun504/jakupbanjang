#!/bin/bash

###############################################################################
# 데이터베이스 백업 스크립트
# 
# 사용법:
#   chmod +x scripts/backup-database.sh
#   ./scripts/backup-database.sh
#
# Cron 자동 백업 설정 (매일 새벽 3시):
#   0 3 * * * /path/to/backup-database.sh
###############################################################################

# 설정
BACKUP_DIR="/app/backups"
DB_NAME="${DB_NAME:-jakupbanjang}"
DB_USER="${DB_USER:-jakup}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"
MAX_BACKUPS=30  # 최대 30개 백업 유지

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

echo "🗄️  데이터베이스 백업 시작: $BACKUP_FILE"

# PostgreSQL 백업
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -F c \
  -b \
  -v \
  -f "$BACKUP_FILE.custom"

# 텍스트 형식도 함께 백업 (복구 시 유용)
PGPASSWORD=$DB_PASSWORD pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f "$BACKUP_FILE"

# 백업 압축
gzip "$BACKUP_FILE"
gzip "$BACKUP_FILE.custom"

# 백업 성공 여부 확인
if [ $? -eq 0 ]; then
  echo "✅ 백업 완료: $BACKUP_FILE.gz"
  
  # 오래된 백업 삭제 (최근 MAX_BACKUPS개만 유지)
  ls -t $BACKUP_DIR/*.gz 2>/dev/null | tail -n +$((MAX_BACKUPS + 1)) | xargs -r rm
  echo "🧹 오래된 백업 정리 완료"
  
  # 백업 파일 목록
  echo "📋 현재 백업 파일 목록:"
  ls -lh $BACKUP_DIR/*.gz 2>/dev/null | tail -n 10
else
  echo "❌ 백업 실패"
  exit 1
fi

# 백업 디스크 사용량 확인
echo "💾 백업 디스크 사용량:"
du -sh $BACKUP_DIR

# 선택사항: S3, Google Cloud Storage 등 클라우드 스토리지에 업로드
# aws s3 cp "$BACKUP_FILE.gz" s3://your-bucket/backups/
# gsutil cp "$BACKUP_FILE.gz" gs://your-bucket/backups/

echo "✨ 백업 프로세스 완료"

