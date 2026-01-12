import React from 'react';
import styled from 'styled-components';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  message?: string;
  transparent?: boolean;
}

/**
 * 전체 화면 로딩 오버레이
 * - 데이터 조회, 등록, 수정, 삭제 등 작업 중 표시
 * - 배경을 반투명하게 하여 사용자가 작업 중임을 명확히 알 수 있음
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  message = '처리 중...', 
  transparent = false 
}) => {
  return (
    <Overlay transparent={transparent}>
      <LoadingContent>
        <LoadingSpinner size="large" message={message} />
      </LoadingContent>
    </Overlay>
  );
};

interface OverlayProps {
  transparent: boolean;
}

const Overlay = styled.div<OverlayProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => 
    props.transparent ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'};
  backdrop-filter: blur(2px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: fadeIn 0.2s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const LoadingContent = styled.div`
  background-color: white;
  padding: 40px 60px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: scaleIn 0.3s ease-in-out;

  @keyframes scaleIn {
    from {
      transform: scale(0.9);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  /* 모바일 대응 */
  @media (max-width: 768px) {
    padding: 30px 40px;
    max-width: 80%;
  }
`;

export default LoadingOverlay;

