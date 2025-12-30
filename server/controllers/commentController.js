const Comment = require('../models/Comment');
const Task = require('../models/Task');
const User = require('../models/User');

// 댓글 생성
exports.createComment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    // 작업이 존재하는지 확인
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: '작업을 찾을 수 없습니다.' });
    }

    const comment = await Comment.create({
      content,
      TaskId: taskId,
      UserId: userId
    });

    // 생성된 댓글과 작성자 정보 함께 반환
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'name', 'role']
        }
      ]
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('댓글 생성 오류:', error);
    res.status(500).json({ message: '댓글 생성에 실패했습니다.' });
  }
};

// 작업의 댓글 목록 조회
exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    const comments = await Comment.findAll({
      where: { TaskId: taskId },
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'name', 'role']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(comments);
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    res.status(500).json({ message: '댓글 조회에 실패했습니다.' });
  }
};

// 댓글 삭제
exports.deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const comment = await Comment.findOne({
      where: {
        id: commentId,
        TaskId: taskId
      }
    });

    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 본인 댓글이거나 관리자인 경우만 삭제 가능
    if (comment.UserId !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: '댓글을 삭제할 권한이 없습니다.' });
    }

    await comment.destroy();
    res.json({ message: '댓글이 삭제되었습니다.' });
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    res.status(500).json({ message: '댓글 삭제에 실패했습니다.' });
  }
};

// 댓글 수정
exports.updateComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findOne({
      where: {
        id: commentId,
        TaskId: taskId
      }
    });

    if (!comment) {
      return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    }

    // 본인 댓글만 수정 가능
    if (comment.UserId !== userId) {
      return res.status(403).json({ message: '댓글을 수정할 권한이 없습니다.' });
    }

    comment.content = content;
    await comment.save();

    const updatedComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          attributes: ['id', 'username', 'name', 'role']
        }
      ]
    });

    res.json(updatedComment);
  } catch (error) {
    console.error('댓글 수정 오류:', error);
    res.status(500).json({ message: '댓글 수정에 실패했습니다.' });
  }
};

