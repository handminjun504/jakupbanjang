const Attachment = require('../models/Attachment');
const Task = require('../models/Task');
const User = require('../models/User');
const path = require('path');
const { uploadFile, deleteFile, STORAGE_BUCKETS } = require('../config/supabase');
const { nanoid } = require('nanoid');

// 첨부파일 업로드 (Supabase Storage 사용)
exports.uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const companyId = req.user.companyId;

    // 작업이 존재하는지 확인
    const task = await Task.findOne({ 
      where: { 
        id: taskId,
        companyId 
      } 
    });
    
    if (!task) {
      return res.status(404).json({ 
        success: false,
        message: '작업을 찾을 수 없습니다.' 
      });
    }

    // 파일이 업로드되었는지 확인
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: '파일이 업로드되지 않았습니다.' 
      });
    }

    // 파일 확장자 추출
    const fileExt = path.extname(req.file.originalname);
    const fileId = nanoid();
    const storagePath = `${companyId}/${taskId}/${fileId}${fileExt}`;

    // Supabase Storage에 업로드
    const uploadResult = await uploadFile(
      STORAGE_BUCKETS.WORK_LOGS,
      storagePath,
      req.file.buffer,
      req.file.mimetype
    );

    if (!uploadResult.success) {
      return res.status(500).json({ 
        success: false,
        message: '파일 업로드에 실패했습니다.' 
      });
    }

    // DB에 첨부파일 정보 저장
    const attachment = await Attachment.create({
      filename: req.file.originalname,
      file_path: uploadResult.publicUrl,
      storage_path: storagePath,
      file_size: req.file.size,
      mime_type: req.file.mimetype,
      task_id: taskId,
      user_id: userId
    });

    // 생성된 첨부파일과 업로더 정보 함께 반환
    const attachmentWithUser = await Attachment.findByPk(attachment.id, {
      include: [
        {
          model: User,
          as: 'uploader',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: '파일이 업로드되었습니다.',
      data: attachmentWithUser
    });
  } catch (error) {
    console.error('첨부파일 업로드 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '첨부파일 업로드에 실패했습니다.',
      error: error.message 
    });
  }
};

// 작업의 첨부파일 목록 조회
exports.getAttachmentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const attachments = await Attachment.findAll({
      where: { TaskId: taskId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'name', 'role']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(attachments);
  } catch (error) {
    console.error('첨부파일 조회 오류:', error);
    res.status(500).json({ message: '첨부파일 조회에 실패했습니다.' });
  }
};

// 첨부파일 삭제 (Supabase Storage)
exports.deleteAttachment = async (req, res) => {
  try {
    const { taskId, attachmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const companyId = req.user.companyId;

    const attachment = await Attachment.findOne({
      where: {
        id: attachmentId,
        task_id: taskId
      },
      include: [{
        model: Task,
        as: 'task',
        where: { companyId }
      }]
    });

    if (!attachment) {
      return res.status(404).json({ 
        success: false,
        message: '첨부파일을 찾을 수 없습니다.' 
      });
    }

    // 본인이 업로드한 파일이거나 관리자인 경우만 삭제 가능
    if (attachment.user_id !== userId && userRole !== 'manager') {
      return res.status(403).json({ 
        success: false,
        message: '첨부파일을 삭제할 권한이 없습니다.' 
      });
    }

    // Supabase Storage에서 파일 삭제
    if (attachment.storage_path) {
      try {
        await deleteFile(STORAGE_BUCKETS.WORK_LOGS, attachment.storage_path);
      } catch (fileError) {
        console.error('Storage 파일 삭제 오류:', fileError);
        // 파일이 이미 없어도 DB 레코드는 삭제
      }
    }

    await attachment.destroy();
    res.json({ 
      success: true,
      message: '첨부파일이 삭제되었습니다.' 
    });
  } catch (error) {
    console.error('첨부파일 삭제 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '첨부파일 삭제에 실패했습니다.',
      error: error.message 
    });
  }
};

// 첨부파일 다운로드 (Supabase Storage)
exports.downloadAttachment = async (req, res) => {
  try {
    const { taskId, attachmentId } = req.params;
    const companyId = req.user.companyId;

    const attachment = await Attachment.findOne({
      where: {
        id: attachmentId,
        task_id: taskId
      },
      include: [{
        model: Task,
        as: 'task',
        where: { companyId }
      }]
    });

    if (!attachment) {
      return res.status(404).json({ 
        success: false,
        message: '첨부파일을 찾을 수 없습니다.' 
      });
    }

    // Supabase Storage의 public URL로 리다이렉트
    if (attachment.file_path) {
      res.redirect(attachment.file_path);
    } else {
      res.status(404).json({ 
        success: false,
        message: '파일을 찾을 수 없습니다.' 
      });
    }
  } catch (error) {
    console.error('첨부파일 다운로드 오류:', error);
    res.status(500).json({ 
      success: false,
      message: '첨부파일 다운로드에 실패했습니다.',
      error: error.message 
    });
  }
};

