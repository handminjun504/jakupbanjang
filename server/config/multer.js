const multer = require('multer');
const path = require('path');

// Supabase Storage 사용을 위해 메모리 스토리지 사용
const storage = multer.memoryStorage();

// 파일 필터 (선택적)
const fileFilter = (req, file, cb) => {
  // 허용할 파일 형식 (필요에 따라 수정)
  const allowedMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('지원하지 않는 파일 형식입니다.'), false);
  }
};

// multer 설정 (Supabase Storage 사용)
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 기본 10MB 제한
  },
  fileFilter: fileFilter
});

module.exports = upload;

