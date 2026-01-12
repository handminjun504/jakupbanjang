import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface ButtonWithLoaderProps {
  loading: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

/**
 * 로딩 스피너가 포함된 버튼
 * - 클릭 시 로딩 상태를 명확하게 표시
 * - 로딩 중에는 버튼 비활성화
 */
const ButtonWithLoader: React.FC<ButtonWithLoaderProps> = ({
  loading,
  children,
  onClick,
  type = 'button',
  disabled = false,
  variant = 'primary',
  fullWidth = false,
}) => {
  return (
    <StyledButton
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      variant={variant}
      fullWidth={fullWidth}
    >
      {loading ? (
        <>
          <Spinner />
          <span>처리 중...</span>
        </>
      ) : (
        children
      )}
    </StyledButton>
  );
};

interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  fullWidth: boolean;
}

const getButtonColors = (variant: string) => {
  switch (variant) {
    case 'secondary':
      return {
        bg: theme.colors.background.secondary,
        text: theme.colors.text.primary,
        hover: '#e0e0e0',
      };
    case 'danger':
      return {
        bg: '#e74c3c',
        text: 'white',
        hover: '#c0392b',
      };
    default: // primary
      return {
        bg: theme.colors.accent,
        text: theme.colors.text.primary,
        hover: theme.colors.accentHover || '#f0c14b',
      };
  }
};

const StyledButton = styled.button<ButtonProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  width: ${props => props.fullWidth ? '100%' : 'auto'};
  
  ${props => {
    const colors = getButtonColors(props.variant);
    return `
      background-color: ${colors.bg};
      color: ${colors.text};
      
      &:hover:not(:disabled) {
        background-color: ${colors.hover};
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
      }
    `;
  }}
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* 모바일 최적화 */
  @media (max-width: 768px) {
    padding: 16px 24px;
    font-size: 15px;
    min-height: 48px; /* 터치 친화적 크기 */
  }
`;

// 버튼 내 스피너
const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default ButtonWithLoader;

