const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set!');
  console.error('Please check your .env file');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Storage 버킷 이름
const STORAGE_BUCKETS = {
  WORK_LOGS: 'work-logs',
  EXPENSES: 'expenses',
  ATTACHMENTS: 'attachments'
};

// 파일 업로드 헬퍼 함수
const uploadFile = async (bucketName, filePath, fileBuffer, contentType) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, fileBuffer, {
        contentType,
        upsert: false
      });

    if (error) throw error;

    // Public URL 생성
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return {
      success: true,
      path: data.path,
      publicUrl: publicUrlData.publicUrl
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

// 파일 삭제 헬퍼 함수
const deleteFile = async (bucketName, filePath) => {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('File delete error:', error);
    throw error;
  }
};

// 버킷 존재 확인 및 생성
const ensureBucketExists = async (bucketName, isPublic = true) => {
  try {
    // 버킷 목록 조회
    const { data: buckets } = await supabase.storage.listBuckets();
    
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      console.log(`📦 Creating bucket: ${bucketName}`);
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: isPublic,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      });

      if (error && error.message !== 'The resource already exists') {
        console.error(`❌ Error creating bucket ${bucketName}:`, error);
      } else {
        console.log(`✅ Bucket ${bucketName} created successfully`);
      }
    } else {
      console.log(`✅ Bucket ${bucketName} already exists`);
    }
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
  }
};

module.exports = {
  supabase,
  STORAGE_BUCKETS,
  uploadFile,
  deleteFile,
  ensureBucketExists
};
