import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { getDashboardStats, DashboardStats, getMyCompany, Company } from '../../api/admin';

const ManagerDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsData, companyData] = await Promise.all([
        getDashboardStats(),
        getMyCompany()
      ]);
      setStats(statsData);
      setCompany(companyData);
      setError('');
    } catch (err: any) {
      setError(err.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteCode = () => {
    if (company?.inviteCode) {
      navigator.clipboard.writeText(company.inviteCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  if (loading) {
    return (
      <Container>
        <PageTitle>관리자 대시보드</PageTitle>
        <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <PageTitle>관리자 대시보드</PageTitle>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  return (
    <Container>
      <PageTitle>관리자 대시보드</PageTitle>
      <Subtitle>전체 현황을 한눈에 확인하세요</Subtitle>

      {/* 초대 코드 섹션 */}
      {company && (
        <InviteCodeBanner>
          <InviteCodeLabel>🔑 초대 코드:</InviteCodeLabel>
          <InviteCode>{company.inviteCode}</InviteCode>
          <CopyButton onClick={handleCopyInviteCode}>
            {copySuccess ? '✓' : '복사'}
          </CopyButton>
        </InviteCodeBanner>
      )}

      <StatsGrid>
        <StatCard>
          <StatIcon>🏗️</StatIcon>
          <StatValue>{stats?.totalSites || 0}</StatValue>
          <StatLabel>전체 현장</StatLabel>
          <StatSubtext>{stats?.activeSites || 0}개 진행 중</StatSubtext>
        </StatCard>

        <StatCard>
          <StatIcon>📋</StatIcon>
          <StatValue>{stats?.totalWorkLogs || 0}</StatValue>
          <StatLabel>총 작업일지</StatLabel>
          <StatSubtext>오늘 {stats?.todayWorkLogs || 0}건 등록</StatSubtext>
        </StatCard>

        <StatCard>
          <StatIcon>👷</StatIcon>
          <StatValue>{stats?.totalWorkers || 0}</StatValue>
          <StatLabel>총 근무자</StatLabel>
          <StatSubtext>작업반장 계정</StatSubtext>
        </StatCard>

        <StatCard>
          <StatIcon>📊</StatIcon>
          <StatValue>
            {stats?.totalWorkLogs && stats?.totalSites
              ? Math.round((stats.totalWorkLogs / stats.totalSites) * 10) / 10
              : 0}
          </StatValue>
          <StatLabel>평균 일지 수</StatLabel>
          <StatSubtext>현장당 작업일지</StatSubtext>
        </StatCard>
      </StatsGrid>

      <Section>
        <SectionTitle>최근 활동</SectionTitle>
        <ActivityCard>
          <ActivityIcon>✅</ActivityIcon>
          <ActivityContent>
            <ActivityTitle>시스템이 정상 작동 중입니다</ActivityTitle>
            <ActivityText>모든 기능이 원활하게 작동하고 있습니다.</ActivityText>
          </ActivityContent>
        </ActivityCard>
      </Section>
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.xl};
  }
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.lg};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 16px;
    margin-bottom: ${theme.spacing.xl};
  }
`;

const InviteCodeBanner = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.lg};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    flex-direction: row;
    align-items: center;
    gap: ${theme.spacing.md};
    padding: ${theme.spacing.md} ${theme.spacing.lg};
  }
`;

const InviteCodeLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 14px;
  }
`;

const InviteCode = styled.code`
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  font-family: 'Courier New', monospace;
  letter-spacing: 1px;
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.small};
  text-align: center;
  word-break: break-all;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    flex: 1;
    font-size: 16px;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    text-align: left;
    word-break: normal;
  }
`;

const CopyButton = styled.button`
  background-color: ${theme.colors.accent};
  color: white;
  border: none;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.small};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  width: 100%;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    width: auto;
    min-width: 50px;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    font-size: 13px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (min-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(4, 1fr);
    gap: ${theme.spacing.lg};
    margin-bottom: ${theme.spacing.xl};
  }
`;

const StatCard = styled.div`
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  text-align: center;
  transition: all 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.xl};
  }
`;

const StatIcon = styled.div`
  font-size: 36px;
  margin-bottom: ${theme.spacing.sm};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 48px;
    margin-bottom: ${theme.spacing.md};
  }
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 36px;
    margin-bottom: ${theme.spacing.sm};
  }
`;

const StatLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 16px;
  }
`;

const StatSubtext = styled.div`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 14px;
  }
`;

const Section = styled.section`
  margin-bottom: ${theme.spacing.lg};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    margin-bottom: ${theme.spacing.xl};
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 20px;
  }
`;

const ActivityCard = styled.div`
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    flex-direction: row;
    text-align: left;
    padding: ${theme.spacing.lg};
    gap: ${theme.spacing.lg};
  }
`;

const ActivityIcon = styled.div`
  font-size: 32px;
  flex-shrink: 0;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 40px;
  }
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 16px;
  }
`;

const ActivityText = styled.div`
  font-size: 13px;
  color: ${theme.colors.text.secondary};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 14px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: #e74c3c;
  background-color: #ffeaea;
  border-radius: ${theme.borderRadius.medium};
`;

export default ManagerDashboard;

