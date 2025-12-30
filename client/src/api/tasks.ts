import axiosInstance from './axios';

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: '요청' | '진행중' | '완료';
  creatorId: number;
  assigneeId?: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    email: string;
    role: string;
  };
  assignee?: {
    id: number;
    email: string;
    role: string;
  };
}

export interface CreateTaskData {
  title: string;
  description?: string;
  assigneeId?: number;
}

export const createTask = async (data: CreateTaskData) => {
  try {
    const response = await axiosInstance.post('/tasks', data);
    return response.data.data || response.data;
  } catch (error: any) {
    throw error.response?.data || { message: '작업 생성 중 오류가 발생했습니다.' };
  }
};

export const getTasks = async () => {
  try {
    const response = await axiosInstance.get('/tasks');
    return response.data.data || response.data;
  } catch (error: any) {
    throw error.response?.data || { message: '작업 목록 조회 중 오류가 발생했습니다.' };
  }
};

export const updateTaskStatus = async (taskId: number, status: string) => {
  try {
    const response = await axiosInstance.patch(`/tasks/${taskId}/status`, { status });
    return response.data.data || response.data;
  } catch (error: any) {
    throw error.response?.data || { message: '작업 상태 업데이트 중 오류가 발생했습니다.' };
  }
};

export const deleteTask = async (taskId: number) => {
  try {
    const response = await axiosInstance.delete(`/tasks/${taskId}`);
    return response.data.data || response.data;
  } catch (error: any) {
    throw error.response?.data || { message: '작업 삭제 중 오류가 발생했습니다.' };
  }
};
