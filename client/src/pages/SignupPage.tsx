import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { StyledInput } from '../components/common/StyledInput';
import StyledButton from '../components/common/StyledButton';
import { theme } from '../styles/theme';
import { signupForeman, signupManager } from '../api/auth';

const SignupPage: React.FC = () => {
  const [userType, setUserType] = useState<'foreman' | 'manager' | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (userType === 'foreman') {
        // 작업반장 회원가입 (이름 + 휴대폰 + 초대 코드)
        await signupForeman(name, phone, password, inviteCode);
        alert('작업반장 회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
      } else {
        // 관리자 회원가입 (이메일 + 기업명)
        const response = await signupManager(email, password, companyName);
        alert(`관리자 계정이 생성되었습니다.\n초대 코드: ${response.data.company.inviteCode}\n\n이 코드를 작업반장들과 공유하세요.`);
      }
      
      // 로그인 페이지로 리다이렉트
      navigate('/login');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <HeaderSection>
        <Logo>JAKUP</Logo>
      </HeaderSection>
      
      <Content>
        <FormWrapper>
          <PageTitle>회원가입</PageTitle>
          
          {userType === null ? (
            // 작업반장 / 관리자 선택
            <ChoiceContainer>
              <ChoiceQuestion>가입 유형을 선택하세요</ChoiceQuestion>
              <ChoiceButtons>
                <ChoiceButton onClick={() => setUserType('foreman')}>
                  👷 작업반장
                  <ChoiceDescription>초대 코드로 기업에 참여</ChoiceDescription>
                </ChoiceButton>
                <ChoiceButton onClick={() => setUserType('manager')}>
                  👔 관리자
                  <ChoiceDescription>새 기업 생성 및 관리</ChoiceDescription>
                </ChoiceButton>
              </ChoiceButtons>
            </ChoiceContainer>
          ) : (
            // 회원가입 폼
            <Form onSubmit={handleSubmit}>
              <BackButton type="button" onClick={() => setUserType(null)}>
                ← 다시 선택
              </BackButton>

              {userType === 'foreman' ? (
                // 작업반장 - 이름 + 휴대폰 + 비밀번호 + 초대 코드
                <>
                  <FormGroup>
                    <Label htmlFor="name">이름</Label>
                    <StyledInput
                      id="name"
                      type="text"
                      placeholder="이름을 입력하세요"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="phone">전화번호</Label>
                    <StyledInput
                      id="phone"
                      type="tel"
                      placeholder="010-1234-5678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="password">비밀번호</Label>
                    <StyledInput
                      id="password"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="inviteCode">회사 코드</Label>
                    <StyledInput
                      id="inviteCode"
                      type="text"
                      placeholder="회사 코드를 입력하세요"
                      value={inviteCode}
                      onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                      required
                    />
                  </FormGroup>
                </>
              ) : (
                // 관리자 - 이메일 + 기업명 + 비밀번호
                <>
                  <FormGroup>
                    <Label htmlFor="email">이메일</Label>
                    <StyledInput
                      id="email"
                      type="email"
                      placeholder="이메일을 입력하세요"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="companyName">기업명</Label>
                    <StyledInput
                      id="companyName"
                      type="text"
                      placeholder="기업명을 입력하세요"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label htmlFor="password">비밀번호</Label>
                    <StyledInput
                      id="password"
                      type="password"
                      placeholder="비밀번호를 입력하세요"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </FormGroup>
                </>
              )}

              {error && <ErrorMessage>{error}</ErrorMessage>}

              <StyledButton type="submit" disabled={loading} fullWidth>
                {loading ? '처리 중...' : '회원가입'}
              </StyledButton>
            </Form>
          )}

          <LinkText>
            이미 계정이 있으신가요? <StyledLink to="/login">로그인</StyledLink>
          </LinkText>
        </FormWrapper>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.background.primary};
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid ${theme.colors.border};
  height: 56px;
`;

const Logo = styled.div`
  background-color: ${theme.colors.accent};
  color: ${theme.colors.text.primary};
  padding: 8px 24px;
  border-radius: ${theme.borderRadius.round};
  font-weight: 700;
  font-size: 16px;
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${theme.spacing.xl} ${theme.spacing.md};
  min-height: calc(100vh - 56px);
`;

const FormWrapper = styled.div`
  width: 100%;
  max-width: 400px;
  
  /* PC 환경에서 폼 너비 증가 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    max-width: ${theme.maxWidth.form};
  }
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.pageTitle.fontSize};
  font-weight: ${theme.typography.pageTitle.fontWeight};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
  padding: 12px 16px;
  background-color: #ffeaea;
  border-radius: ${theme.borderRadius.medium};
`;

const ChoiceContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
  padding: ${theme.spacing.lg} 0;
`;

const ChoiceQuestion = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  text-align: center;
`;

const ChoiceButtons = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ChoiceButton = styled.button`
  padding: ${theme.spacing.xl};
  background-color: ${theme.colors.background.secondary};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.sm};

  &:hover {
    background-color: ${theme.colors.accent};
    border-color: ${theme.colors.accent};
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ChoiceDescription = styled.span`
  font-size: 14px;
  font-weight: 400;
  opacity: 0.8;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.text.secondary};
  font-size: 14px;
  cursor: pointer;
  padding: ${theme.spacing.sm} 0;
  text-align: left;
  margin-bottom: ${theme.spacing.md};

  &:hover {
    color: ${theme.colors.text.primary};
    text-decoration: underline;
  }
`;

const LinkText = styled.p`
  text-align: center;
  margin-top: ${theme.spacing.lg};
  font-size: 14px;
  color: ${theme.colors.text.secondary};
`;

const StyledLink = styled(Link)`
  color: ${theme.colors.text.primary};
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }
`;

export default SignupPage;
