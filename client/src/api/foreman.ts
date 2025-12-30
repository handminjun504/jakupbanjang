import apiClient from './axios';
import { AxiosError } from 'axios';

/**
 * 타입 정의
 */
export interface Site {
  id: number;
  name: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: number;
  name: string;
  rrn?: string;
  rrnDisplay?: string;
  phoneNumber?: string;
  dailyRate?: number;
  remarks?: string;
  status: 'active' | 'resigned';
  resignedDate?: string;
  createdAt: string;
}

export interface WorkLog {
  id: number;
  workDate: string;
  description: string;
  effort: number;
  dailyRate?: number;
  createdAt: string;
  updatedAt: string;
  worker?: Worker;
  site?: Site;
  creator?: {
    id: number;
    email: string;
    phone?: string;
    role: string;
  };
}

/**
 * API 에러 핸들러
 */
const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (error instanceof AxiosError) {
    throw new Error(error.response?.data?.message || defaultMessage);
  }
  throw new Error(defaultMessage);
};

// 현장 목록 조회
export const getSites = async (): Promise<Site[]> => {
  try {
    const response = await apiClient.get<{ data: Site[] }>('/foreman/sites');
    return response.data.data || (response.data as unknown as Site[]);
  } catch (error) {
    return handleApiError(error, '현장 목록 조회에 실패했습니다.');
  }
};

// 근무자 추가
export const createWorker = async (workerData: {
  name: string;
  rrn: string;
  phoneNumber?: string;
  dailyRate?: number;
  remarks?: string;
}): Promise<Worker> => {
  try {
    const response = await apiClient.post<{ data: Worker }>('/foreman/workers', workerData);
    return response.data.data || (response.data as unknown as Worker);
  } catch (error) {
    return handleApiError(error, '근무자 추가에 실패했습니다.');
  }
};

// 근무자 목록 조회 (작업반장별 통합 관리)
export const getWorkersBySite = async (): Promise<Worker[]> => {
  try {
    const response = await apiClient.get<{ data: Worker[] }>('/foreman/workers');
    return response.data.data || (response.data as unknown as Worker[]);
  } catch (error) {
    return handleApiError(error, '근무자 목록 조회에 실패했습니다.');
  }
};

// 특정 근무자 조회
export const getWorkerById = async (workerId: number): Promise<Worker> => {
  try {
    const response = await apiClient.get<{ data: Worker }>(`/foreman/workers/${workerId}`);
    return response.data.data || (response.data as unknown as Worker);
  } catch (error) {
    return handleApiError(error, '근무자 정보 조회에 실패했습니다.');
  }
};

// 근무자 정보 수정
export const updateWorker = async (workerId: number, workerData: {
  name?: string;
  phoneNumber?: string;
  dailyRate?: number;
  remarks?: string;
  status?: string;
}): Promise<Worker> => {
  try {
    const response = await apiClient.put<{ data: Worker }>(`/foreman/workers/${workerId}`, workerData);
    return response.data.data || (response.data as unknown as Worker);
  } catch (error) {
    return handleApiError(error, '근무자 정보 수정에 실패했습니다.');
  }
};

/**
 * 근무자 퇴사 처리 (권장)
 * 실제 삭제가 아닌 status를 'resigned'로 변경
 * 기존 작업일지는 그대로 유지
 */
export const resignWorker = async (workerId: number): Promise<Worker> => {
  try {
    const response = await apiClient.put<{ data: Worker }>(`/foreman/workers/${workerId}/resign`);
    return response.data.data || (response.data as unknown as Worker);
  } catch (error) {
    return handleApiError(error, '근무자 퇴사 처리에 실패했습니다.');
  }
};

/**
 * 근무자 삭제 (레거시)
 * @deprecated resignWorker 사용을 권장합니다
 */
export const deleteWorker = async (workerId: number): Promise<void> => {
  try {
    await apiClient.delete(`/foreman/workers/${workerId}`);
  } catch (error) {
    return handleApiError(error, '근무자 삭제에 실패했습니다.');
  }
};

// 현장별 작업 목록 조회
export const getTasksBySite = async (siteId: number) => {
  try {
    const response = await apiClient.get(`/foreman/tasks?siteId=${siteId}`);
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '작업 목록 조회에 실패했습니다.');
  }
};

// 작업일지 등록
export const createWorkLog = async (workLogData: {
  workerId: number;
  description: string;
  effort: number;
  workDate: string;
  siteId: number;
}) => {
  try {
    const response = await apiClient.post('/foreman/worklogs', workLogData);
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '작업일지 등록에 실패했습니다.');
  }
};

// 작업일지 목록 조회
export const getWorkLogs = async (siteId: number, workDate?: string) => {
  try {
    const params = workDate 
      ? `/foreman/worklogs?siteId=${siteId}&workDate=${workDate}`
      : `/foreman/worklogs?siteId=${siteId}`;
    const response = await apiClient.get(params);
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '작업일지 조회에 실패했습니다.');
  }
};

// 근무자 목록 조회 (간단 버전 - 작업일지 등록용)
export const getWorkersList = async () => {
  try {
    const response = await apiClient.get('/foreman/workers-list');
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '근무자 목록 조회에 실패했습니다.');
  }
};

// 작업일지 수정
export const updateWorkLog = async (workLogId: number, workLogData: {
  description?: string;
  effort?: number;
  workDate?: string;
}) => {
  try {
    const response = await apiClient.put(`/foreman/worklogs/${workLogId}`, workLogData);
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '작업일지 수정에 실패했습니다.');
  }
};

// 작업일지 삭제
export const deleteWorkLog = async (workLogId: number) => {
  try {
    const response = await apiClient.delete(`/foreman/worklogs/${workLogId}`);
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '작업일지 삭제에 실패했습니다.');
  }
};

// 지출결의 등록
export const createExpense = async (expenseData: {
  title: string;
  content: string;
  amount: number;
  expenseDate: string;
  siteId: number;
}) => {
  try {
    const response = await apiClient.post('/foreman/expenses', expenseData);
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '지출결의 등록에 실패했습니다.');
  }
};

// 지출결의 목록 조회
export const getExpenses = async (siteId?: number, status?: string) => {
  try {
    let url = '/foreman/expenses';
    const params = [];
    if (siteId) params.push(`siteId=${siteId}`);
    if (status) params.push(`status=${status}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    
    const response = await apiClient.get(url);
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '지출결의 목록 조회에 실패했습니다.');
  }
};

// 파일 업로드 (작업일지 첨부파일)
export const uploadAttachment = async (taskId: number, file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '파일 업로드에 실패했습니다.');
  }
};

// 첨부파일 목록 조회
export const getAttachments = async (taskId: number) => {
  try {
    const response = await apiClient.get(`/tasks/${taskId}/attachments`);
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '첨부파일 목록 조회에 실패했습니다.');
  }
};

// 첨부파일 삭제
export const deleteAttachment = async (taskId: number, attachmentId: number) => {
  try {
    const response = await apiClient.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
    return response.data.data || response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || '첨부파일 삭제에 실패했습니다.');
  }
};

