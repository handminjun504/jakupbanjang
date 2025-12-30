import React from 'react';
import { Navigate } from 'react-router-dom';
import { getUserRole } from '../utils/auth';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRole?: 'manager' | 'foreman';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, requiredRole }) => {
  const token = localStorage.getItem('token');

  // 토큰이 없으면 로그인 페이지로
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 특정 역할이 필요한 경우
  if (requiredRole) {
    const userRole = getUserRole();

    // 역할이 일치하지 않으면 홈으로 리다이렉트
    if (userRole !== requiredRole) {
      // 관리자가 작업반장 페이지에 접근하려 하면 관리자 대시보드로
      if (userRole === 'manager' && requiredRole === 'foreman') {
        return <Navigate to="/manager/dashboard" replace />;
      }
      
      // 작업반장이 관리자 페이지에 접근하려 하면 작업반장 페이지로
      if (userRole === 'foreman' && requiredRole === 'manager') {
        return <Navigate to="/foreman/tasks" replace />;
      }

      // 그 외의 경우 홈으로
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
