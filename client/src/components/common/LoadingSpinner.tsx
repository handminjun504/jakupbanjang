import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = theme.colors.accent,
  message 
}) => {
  return (
    <SpinnerWrapper>
      <Spinner size={size} color={color} />
      {message && <LoadingMessage>{message}</LoadingMessage>}
    </SpinnerWrapper>
  );
};

// 회전 애니메이션
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
`;

interface SpinnerProps {
  size: 'small' | 'medium' | 'large';
  color: string;
}

const sizeMap = {
  small: '20px',
  medium: '40px',
  large: '60px'
};

const borderWidthMap = {
  small: '2px',
  medium: '4px',
  large: '6px'
};

const Spinner = styled.div<SpinnerProps>`
  width: ${props => sizeMap[props.size]};
  height: ${props => sizeMap[props.size]};
  border: ${props => borderWidthMap[props.size]} solid rgba(0, 0, 0, 0.1);
  border-top: ${props => borderWidthMap[props.size]} solid ${props => props.color};
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingMessage = styled.p`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  font-weight: 500;
  margin: 0;
`;

export default LoadingSpinner;

