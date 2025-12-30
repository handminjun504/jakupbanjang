#!/bin/bash

###############################################################################
# 데이터베이스 복구 스크립트
# 
# 사용법:
#   chmod +x scripts/restore-database.sh
#   ./scripts/restore-database.sh /path/to/backup.sql.gz
###############################################################################

# 백업 파일 확인
if [ -z "$1" ]; then
  echo "❌ 사용법: $0 <backup_file.sql.gz>"
  echo "📋 사용 가능한 백업 파일:"
  ls -lh /app/backups/*.gz 2>/dev/null | tail -n 10
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ 백업 파일을 찾을 수 없습니다: $BACKUP_FILE"
  exit 1
fi

# 설정
DB_NAME="${DB_NAME:-jakupbanjang}"
DB_USER="${DB_USER:-jakup}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "⚠️  경고: 현재 데이터베이스의 데이터가 모두 삭제됩니다!"
echo "📂 복구할 백업: $BACKUP_FILE"
echo "🗄️  대상 데이터베이스: $DB_NAME"
read -p "계속하시겠습니까? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "❌ 복구가 취소되었습니다."
  exit 0
fi

# 임시 디렉토리
TEMP_DIR=$(mktemp -d)
TEMP_FILE="$TEMP_DIR/restore.sql"

echo "🔓 백업 파일 압축 해제 중..."
gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"

if [ $? -ne 0 ]; then
  echo "❌ 압축 해제 실패"
  rm -rf "$TEMP_DIR"
  exit 1
fi

echo "🗑️  기존 데이터베이스 연결 종료 중..."
PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c \
  "SELECT pg_terminate_backend(pg_stat_activity.pid) FROM pg_stat_activity WHERE pg_stat_activity.datname = '$DB_NAME' AND pid <> pg_backend_pid();"

echo "🔄 데이터베이스 복구 중..."
if [[ "$BACKUP_FILE" == *.custom.gz ]]; then
  # Custom 형식 복구
  PGPASSWORD=$DB_PASSWORD pg_restore \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -c \
    -v \
    "$TEMP_FILE"
else
  # SQL 텍스트 형식 복구
  PGPASSWORD=$DB_PASSWORD psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    < "$TEMP_FILE"
fi

# 정리
rm -rf "$TEMP_DIR"

if [ $? -eq 0 ]; then
  echo "✅ 데이터베이스 복구 완료"
  
  # 복구 후 검증
  echo "🔍 복구 검증 중..."
  TABLE_COUNT=$(PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';")
  echo "📊 복구된 테이블 수: $TABLE_COUNT"
else
  echo "❌ 데이터베이스 복구 실패"
  exit 1
fi

echo "✨ 복구 프로세스 완료"

