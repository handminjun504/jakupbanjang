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
  font-size: 16px;
  font-weight: 600;
  width: ${props => props.$fullWidth ? '100%' : 'auto'};
  transition: opacity 0.2s;
  
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

