import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface StyledButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

const ButtonStyled = styled.button<{ $variant?: 'primary' | 'secondary'; $fullWidth?: boolean }>`
  padding: 14px 24px;
  border-radius: ${theme.borderRadius.medium};
  font-size: 17px;
  font-weight: 600;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  min-height: ${theme.touchTarget.minHeight};
  transition: opacity 0.2s;
  letter-spacing: 0.3px;

  ${props => props.$variant === 'primary' ? `
    background-color: ${theme.colors.button.primary};
    color: ${theme.colors.text.primary};
  ` : `
    background-color: ${theme.colors.button.secondary};
    color: ${theme.colors.text.primary};
  `}

  &:hover {
    opacity: 0.8;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

export const StyledButton: React.FC<StyledButtonProps> = ({ 
  variant = 'primary', 
  fullWidth = false, 
  ...props 
}) => {
  return <ButtonStyled $variant={variant} $fullWidth={fullWidth} {...props} />;
};

export default StyledButton;

