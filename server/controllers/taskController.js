const Task = require('../models/Task');
const User = require('../models/User');

// 작업 생성
exports.createTask = async (req, res) => {
  try {
    const { title, description, assigneeId } = req.body;
    const creatorId = req.user.id;

    // 필수 필드 검증
    if (!title) {
      return res.status(400).json({ 
        message: '작업 제목은 필수 항목입니다.' 
      });
    }

    // assigneeId가 제공된 경우, 해당 사용자가 존재하는지 확인
    if (assigneeId) {
      const assignee = await User.findByPk(assigneeId);
      if (!assignee) {
        return res.status(404).json({ 
          message: '지정된 담당자를 찾을 수 없습니다.' 
        });
      }
    }

    // 작업 생성
    const newTask = await Task.create({
      title,
      description,
      creatorId,
      assigneeId: assigneeId || null,
      status: '요청'
    });

    // 생성된 작업과 관련 정보를 함께 조회
    const taskWithDetails = await Task.findByPk(newTask.id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'email', 'role'] },
        { model: User, as: 'assignee', attributes: ['id', 'email', 'role'] }
      ]
    });

    return res.status(201).json({
      message: '작업이 생성되었습니다.',
      task: taskWithDetails
    });

  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ 
      message: '작업 생성 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
};

// 작업 목록 조회
exports.getAllTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let tasks;

    if (userRole === 'manager') {
      // 관리자는 모든 작업 조회
      tasks = await Task.findAll({
        include: [
          { model: User, as: 'creator', attributes: ['id', 'email', 'role'] },
          { model: User, as: 'assignee', attributes: ['id', 'email', 'role'] }
        ],
        order: [['createdAt', 'DESC']]
      });
    } else {
      // 작업반장은 자신에게 할당된 작업만 조회
      tasks = await Task.findAll({
        where: { assigneeId: userId },
        include: [
          { model: User, as: 'creator', attributes: ['id', 'email', 'role'] },
          { model: User, as: 'assignee', attributes: ['id', 'email', 'role'] }
        ],
        order: [['createdAt', 'DESC']]
      });
    }

    return res.status(200).json({
      message: '작업 목록을 조회했습니다.',
      tasks,
      count: tasks.length
    });

  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ 
      message: '작업 목록 조회 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
};

// 작업 상태 업데이트
exports.updateTaskStatus = async (req, res) => {
  try {
    const taskId = req.params.id;
    const { status } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // 상태 값 검증
    const validStatuses = ['요청', '진행중', '완료'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: '유효하지 않은 상태 값입니다. (요청, 진행중, 완료 중 선택)' 
      });
    }

    // 작업 조회
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ 
        message: '작업을 찾을 수 없습니다.' 
      });
    }

    // 권한 확인: 자신에게 할당된 작업이거나 관리자인 경우만 수정 가능
    if (task.assigneeId !== userId && userRole !== 'manager') {
      return res.status(403).json({ 
        message: '이 작업의 상태를 변경할 권한이 없습니다.' 
      });
    }

    // 상태 업데이트
    task.status = status;
    await task.save();

    // 업데이트된 작업 정보 조회
    const updatedTask = await Task.findByPk(taskId, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'email', 'role'] },
        { model: User, as: 'assignee', attributes: ['id', 'email', 'role'] }
      ]
    });

    return res.status(200).json({
      message: '작업 상태가 업데이트되었습니다.',
      task: updatedTask
    });

  } catch (error) {
    console.error('Update task status error:', error);
    return res.status(500).json({ 
      message: '작업 상태 업데이트 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
};

// 작업 삭제
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    // 작업 조회
    const task = await Task.findByPk(taskId);

    if (!task) {
      return res.status(404).json({ 
        message: '작업을 찾을 수 없습니다.' 
      });
    }

    // 권한 확인: 작업 생성자 또는 관리자만 삭제 가능
    if (task.creatorId !== userId && userRole !== 'manager') {
      return res.status(403).json({ 
        message: '이 작업을 삭제할 권한이 없습니다.' 
      });
    }

    // 작업 삭제
    await task.destroy();

    return res.status(200).json({
      message: '작업이 삭제되었습니다.',
      taskId: taskId
    });

  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ 
      message: '작업 삭제 중 오류가 발생했습니다.',
      error: error.message 
    });
  }
};

