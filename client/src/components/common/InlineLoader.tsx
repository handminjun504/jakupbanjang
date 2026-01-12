import React from 'react';
import styled from 'styled-components';
import LoadingSpinner from './LoadingSpinner';
import { theme } from '../../styles/theme';

interface InlineLoaderProps {
  message?: string;
  height?: string;
}

/**
 * 인라인 로딩 표시
 * - 페이지 내 특정 영역의 로딩 상태 표시
 * - 데이터 조회 중, 목록 불러오는 중 등
 */
const InlineLoader: React.FC<InlineLoaderProps> = ({ 
  message = '로딩 중...', 
  height = '300px' 
}) => {
  return (
    <Container height={height}>
      <LoadingSpinner size="medium" message={message} />
    </Container>
  );
};

interface ContainerProps {
  height: string;
}

const Container = styled.div<ContainerProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: ${props => props.height};
  width: 100%;
  background-color: ${theme.colors.background.primary};
`;

export default InlineLoader;

