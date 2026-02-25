import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const StyledInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 16px;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.primary};
  min-height: ${theme.touchTarget.minHeight};

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }

  &:focus {
    border-color: ${theme.colors.accent};
    box-shadow: 0 0 0 2px rgba(255, 214, 68, 0.2);
  }

  &:disabled {
    background-color: ${theme.colors.background.secondary};
    cursor: not-allowed;
  }
`;

export const StyledSelect = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 16px;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.primary};
  min-height: ${theme.touchTarget.minHeight};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
    box-shadow: 0 0 0 2px rgba(255, 214, 68, 0.2);
  }

  &:disabled {
    background-color: ${theme.colors.background.secondary};
    cursor: not-allowed;
  }
`;

export const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 16px;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.primary};
  min-height: 120px;
  resize: vertical;

  &::placeholder {
    color: ${theme.colors.text.secondary};
  }

  &:focus {
    border-color: ${theme.colors.accent};
    box-shadow: 0 0 0 2px rgba(255, 214, 68, 0.2);
  }

  &:disabled {
    background-color: ${theme.colors.background.secondary};
    cursor: not-allowed;
  }
`;

export default StyledInput;

