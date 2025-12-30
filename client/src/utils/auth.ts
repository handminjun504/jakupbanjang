// JWT 디코딩 및 역할 확인 유틸리티

interface JWTPayload {
  id: number;
  email: string;
  role: 'manager' | 'foreman';
  iat: number;
  exp: number;
}

/**
 * JWT 토큰 디코딩
 */
export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Token decode error:', error);
    return null;
  }
};

/**
 * 로컬 스토리지에서 토큰 가져오기
 */
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * 현재 사용자의 역할 가져오기
 */
export const getUserRole = (): 'manager' | 'foreman' | null => {
  const token = getToken();
  if (!token) return null;

  const payload = decodeToken(token);
  return payload ? payload.role : null;
};

/**
 * 사용자가 관리자인지 확인
 */
export const isManager = (): boolean => {
  return getUserRole() === 'manager';
};

/**
 * 사용자가 작업반장인지 확인
 */
export const isForeman = (): boolean => {
  return getUserRole() === 'foreman';
};

/**
 * 사용자 정보 가져오기
 */
export const getUserInfo = (): JWTPayload | null => {
  const token = getToken();
  if (!token) return null;

  return decodeToken(token);
};

/**
 * 로그아웃
 */
export const logout = (): void => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

