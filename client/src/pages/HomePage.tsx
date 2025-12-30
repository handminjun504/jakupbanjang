import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import StyledButton from '../components/common/StyledButton';
import { theme } from '../styles/theme';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <ContentWrapper>
        <LogoSection>
          <Logo>JAKUP</Logo>
        </LogoSection>
        
        <MainContent>
          <Title>현장선택</Title>
          <Subtitle>선택해주세요</Subtitle>
        </MainContent>
        
        <ButtonSection>
          <StyledButton 
            variant="primary" 
            onClick={() => navigate('/login')}
            fullWidth
          >
            로그인
          </StyledButton>
          <StyledButton 
            variant="secondary" 
            onClick={() => navigate('/signup')}
            fullWidth
          >
            회원가입
          </StyledButton>
        </ButtonSection>
      </ContentWrapper>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.background.primary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.md};
`;

const ContentWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xl};
  
  /* PC 환경에서 최대 너비 증가 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    max-width: ${theme.maxWidth.form};
    gap: 60px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${theme.spacing.lg};
`;

const Logo = styled.div`
  background-color: ${theme.colors.accent};
  color: ${theme.colors.text.primary};
  padding: 12px 32px;
  border-radius: ${theme.borderRadius.round};
  font-weight: 700;
  font-size: 20px;
  
  /* PC 환경에서 로고 크기 증가 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 16px 40px;
    font-size: 24px;
  }
`;

const MainContent = styled.div`
  text-align: center;
  width: 100%;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
  
  /* PC 환경에서 제목 크기 증가 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  font-weight: 400;
  color: ${theme.colors.text.secondary};
  
  /* PC 환경에서 부제목 크기 증가 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 18px;
  }
`;

const ButtonSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-top: auto;
  
  /* PC 환경에서 버튼 간격 증가 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    gap: ${theme.spacing.lg};
  }
`;

export default HomePage;

