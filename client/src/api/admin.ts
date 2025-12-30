import axios from './axios';

// 현장(Site) 관련 인터페이스
export interface Site {
  id: number;
  name: string;
  address?: string;
  managerId: number;
  status: 'active' | 'completed' | 'suspended';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  manager?: {
    id: number;
    email: string;
    role: string;
  };
  assignedForemen?: {
    id: number;
    name?: string;
    phone: string;
    email?: string;
  }[];
}

// 첨부파일 인터페이스
export interface Attachment {
  id: number;
  filename: string;
  file_path: string; // snake_case (백엔드 필드명)
  file_size: number; // snake_case (백엔드 필드명)
  mime_type: string; // snake_case (백엔드 필드명)
  createdAt: string;
}

// 작업일지 인터페이스
export interface WorkLog {
  id: number;
  title: string;
  description?: string;
  status: string;
  siteId?: number;
  creatorId: number;
  createdAt: string;
  updatedAt: string;
  paymentStatus?: '미지급' | '지급완료';
  paymentDate?: string;
  isPaid?: boolean;
  effort?: number;
  dailyRate?: number;
  workDate?: string;
  attachments?: Attachment[];  // 첨부파일 추가
  creator?: {
    id: number;
    name?: string;
    email: string;
    phone?: string;
    role: string;
  };
  site?: {
    id: number;
    name: string;
    address?: string;
  };
  worker?: {
    id: number;
    name: string;
    phoneNumber?: string;
    dailyRate?: number;
  };
}

// 근무자 인터페이스
export interface Worker {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

// 대시보드 통계 인터페이스
export interface DashboardStats {
  totalSites: number;
  activeSites: number;
  totalWorkLogs: number;
  todayWorkLogs: number;
  totalWorkers: number;
}

// 기업 정보 인터페이스
export interface Company {
  id: number;
  name: string;
  inviteCode: string;
  createdAt: string;
}

/**
 * 내 기업 정보 조회
 */
export const getMyCompany = async (): Promise<Company> => {
  const response = await axios.get('/admin/my-company');
  return response.data.data;
};

/**
 * 대시보드 통계 조회
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await axios.get('/admin/dashboard/stats');
  return response.data.data;
};

/**
 * 현장 목록 조회
 */
export const getSites = async (): Promise<Site[]> => {
  const response = await axios.get('/admin/sites');
  return response.data.data;
};

/**
 * 새 현장 생성
 */
export const createSite = async (siteData: {
  name: string;
  address?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Site> => {
  const response = await axios.post('/admin/sites', siteData);
  return response.data.data;
};

/**
 * 현장 수정
 */
export const updateSite = async (
  id: number,
  siteData: Partial<Site>
): Promise<Site> => {
  const response = await axios.put(`/admin/sites/${id}`, siteData);
  return response.data.data;
};

/**
 * 현장 삭제
 */
export const deleteSite = async (id: number): Promise<void> => {
  await axios.delete(`/admin/sites/${id}`);
};

/**
 * 작업반장 목록 조회
 */
export interface Foreman {
  id: number;
  name?: string;
  phone: string;
  email?: string;
  createdAt: string;
}

export const getForemen = async (): Promise<Foreman[]> => {
  const response = await axios.get('/admin/foremen');
  return response.data.data;
};

/**
 * 현장에 작업반장 할당
 */
export const assignForemenToSite = async (siteId: number, foremanIds: number[]): Promise<Site> => {
  const response = await axios.post(`/admin/sites/${siteId}/assign-foremen`, { foremanIds });
  return response.data.data;
};

/**
 * 작업일지 조회
 */
export const getAllWorkLogs = async (filters?: {
  siteId?: number;
  creatorId?: number;
  startDate?: string;
  endDate?: string;
}): Promise<WorkLog[]> => {
  const response = await axios.get('/admin/worklogs', { params: filters });
  return response.data.data;
};

/**
 * 근무자 목록 조회
 */
export const getAllWorkers = async (): Promise<Worker[]> => {
  const response = await axios.get('/admin/workers');
  return response.data.data;
};

// 지출결의 인터페이스
export interface Expense {
  id: number;
  title: string;
  content: string;
  amount: number;
  expenseDate: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: string;
  approvalDate?: string;
  attachmentUrl?: string; // 첨부파일 URL 추가
  site?: {
    id: number;
    name: string;
    address?: string;
  };
  creator?: {
    id: number;
    email: string;
    phone?: string;
    role: string;
  };
  approver?: {
    id: number;
    email: string;
    role: string;
  };
}

/**
 * 지출결의 목록 조회 (관리자용)
 */
export const getAllExpenses = async (filters?: {
  status?: string;
  siteId?: number;
}): Promise<Expense[]> => {
  const response = await axios.get('/admin/expenses', { params: filters });
  return response.data.data;
};

/**
 * 지출결의 승인
 */
export const approveExpense = async (id: number): Promise<Expense> => {
  const response = await axios.put(`/admin/expenses/${id}/approve`);
  return response.data.data;
};

/**
 * 지출결의 거절
 */
export const rejectExpense = async (id: number, rejectReason: string): Promise<Expense> => {
  const response = await axios.put(`/admin/expenses/${id}/reject`, { rejectReason });
  return response.data.data;
};

/**
 * 작업일지 지급 완료 처리
 */
export const markWorkLogsAsPaid = async (workLogIds: number[], paymentDate: string) => {
  const response = await axios.put('/admin/worklogs/mark-as-paid', {
    workLogIds,
    paymentDate
  });
  return response.data.data;
};

/**
 * 집계 데이터 조회
 */
export interface AggregationFilters {
  type?: 'worklog' | 'expense' | 'all';
  startDate?: string;
  endDate?: string;
  siteId?: number;
  creatorId?: number;
  workerId?: number;
  paymentStatus?: '미지급' | '지급완료' | 'all';
}

export interface AggregationSummary {
  totalAmount: number;
  totalCount: number;
  workLogAmount: number;
  workLogCount: number;
  expenseAmount: number;
  expenseCount: number;
  paidAmount: number;
  unpaidAmount: number;
}

export interface AggregationItem {
  id: number;
  type: 'worklog' | 'expense';
  date: string;
  site?: {
    id: number;
    name: string;
    address?: string;
  };
  creator?: {
    id: number;
    name?: string;
    email: string;
    phone?: string;
    role: string;
  };
  worker?: {
    id: number;
    name: string;
    phoneNumber?: string;
    dailyRate?: number;
  };
  description?: string;
  title?: string;
  content?: string;
  effort?: number;
  dailyRate?: number;
  amount: number;
  paymentStatus: string;
  paymentDate?: string;
  status?: string;
  createdAt: string;
}

export interface AggregationData {
  summary: AggregationSummary;
  workLogs: AggregationItem[];
  expenses: AggregationItem[];
  allData: AggregationItem[];
}

export const getAggregationData = async (filters: AggregationFilters): Promise<AggregationData> => {
  const response = await axios.get('/admin/aggregation', { params: filters });
  return response.data.data;
};

