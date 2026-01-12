import axios from 'axios';
import axiosInstance from './axios';

const REFRESH_TOKEN_URL = '/auth/refresh';

let isRefreshing = false;
let failedQueue: { resolve: (value?: unknown) => void; reject: (reason?: any) => void }[] = [];

const processQueue = (error: any | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Axios 인터셉터: 401 Unauthorized 에러 처리 및 토큰 자동 갱신
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, refresh 토큰 요청이 아니며, 이미 재시도하지 않은 경우
    if (error.response && error.response.status === 401 && !originalRequest._retry && originalRequest.url !== REFRESH_TOKEN_URL) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // 이미 토큰 갱신 중이면, 큐에 요청을 추가하고 대기
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axiosInstance(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${axiosInstance.defaults.baseURL}${REFRESH_TOKEN_URL}`, { refreshToken });

          if (res.data.success && res.data.data.accessToken && res.data.data.refreshToken) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            processQueue(null, accessToken);
            return axiosInstance(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        processQueue(refreshError, null);
      } finally {
        isRefreshing = false;
      }

      // Refresh token 실패 또는 없음: 로그아웃 처리
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 토큰 저장
export const setTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('token', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
};

// 토큰 가져오기
export const getAccessToken = () => {
  return localStorage.getItem('token');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken');
};

// 로그아웃 (모든 토큰 삭제)
export const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  delete axiosInstance.defaults.headers.common['Authorization'];
};

// 백엔드에 로그아웃 요청
export const logoutApi = async () => {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await axiosInstance.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Backend logout failed:', error);
    }
  }
  clearTokens();
};

// 모든 기기에서 로그아웃 요청
export const logoutAllApi = async () => {
  try {
    await axiosInstance.post('/auth/logout-all');
  } catch (error) {
    console.error('Backend logout all failed:', error);
  } finally {
    clearTokens();
  }
};

