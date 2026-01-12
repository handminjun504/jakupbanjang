import axios from 'axios';

// 환경에 따라 API URL 설정
// Vercel 배포 시: REACT_APP_API_URL 환경 변수 사용
// 로컬 개발 시: localhost:3001 사용
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const axiosInstance = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: 모든 요청에 JWT 토큰 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 401 Unauthorized 에러 처리
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // 로그인/회원가입 요청이 아닐 때만 리다이렉트
      // (로그인 실패는 컴포넌트에서 처리)
      const isAuthRequest = error.config?.url?.includes('/auth/login') || 
                           error.config?.url?.includes('/auth/signup') ||
                           error.config?.url?.includes('/auth/refresh');
      
      if (!isAuthRequest) {
        // 인증이 필요한 API 요청 실패 시에만 로그인 페이지로 이동
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
