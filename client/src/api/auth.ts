import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 회원가입 API (레거시)
export const signup = async (email: string, password: string, role: string) => {
  try {
    const response = await api.post('/auth/signup', {
      email,
      password,
      role
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: '회원가입 중 오류가 발생했습니다.' };
  }
};

// 작업반장 회원가입 (초대 코드 사용, 휴대폰 번호로 가입)
export const signupForeman = async (name: string, phone: string, password: string, inviteCode: string) => {
  try {
    const response = await api.post('/auth/signup-foreman', {
      name,
      phone,
      password,
      inviteCode
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: '회원가입 중 오류가 발생했습니다.' };
  }
};

// 관리자 회원가입 (새 기업 생성)
export const signupManager = async (email: string, password: string, companyName: string) => {
  try {
    const response = await api.post('/auth/signup-manager', {
      email,
      password,
      companyName
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: '회원가입 중 오류가 발생했습니다.' };
  }
};

// 로그인 API (작업반장=휴대폰, 관리자=이메일)
export const login = async (identifier: string, password: string, userType: 'foreman' | 'manager') => {
  try {
    const response = await api.post('/auth/login', {
      identifier,
      password,
      userType
    });
    
    // 로그인 성공 시 JWT를 로컬 스토리지에 저장
    // 표준 응답 형식: { success, message, data: { token, user } }
    if (response.data.data && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
    }
    
    return response.data;
  } catch (error: any) {
    throw error.response?.data || { message: '로그인 중 오류가 발생했습니다.' };
  }
};

// 로그아웃 (토큰 삭제)
export const logout = () => {
  localStorage.removeItem('token');
};

// 토큰 가져오기
export const getToken = () => {
  return localStorage.getItem('token');
};

export default api;

