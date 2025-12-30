import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const StyledInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.primary};
  
  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
  
  &:focus {
    border-color: ${theme.colors.text.secondary};
  }
  
  &:disabled {
    background-color: ${theme.colors.background.secondary};
    cursor: not-allowed;
  }
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.primary};
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
  
  &:disabled {
    background-color: ${theme.colors.background.secondary};
    cursor: not-allowed;
  }
`;

export const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.primary};
  min-height: 100px;
  resize: vertical;
  
  &::placeholder {
    color: ${theme.colors.text.secondary};
  }
  
  &:focus {
    border-color: ${theme.colors.text.secondary};
  }
  
  &:disabled {
    background-color: ${theme.colors.background.secondary};
    cursor: not-allowed;
  }
`;

export default StyledInput;

