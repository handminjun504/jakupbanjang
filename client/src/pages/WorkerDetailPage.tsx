import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, useLocation } from 'react-router-dom';
import Header from '../components/common/Header';
import StyledButton from '../components/common/StyledButton';
import { theme } from '../styles/theme';

interface Worker {
  id: number;
  name: string;
  birthdate: string;
  workDate: string;
  siteName: string;
  workHours?: string;
  notes?: string;
}

interface WorkHistory {
  date: string;
  content: string;
}

const WorkerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const workerFromState = location.state?.worker;
  
  const [worker, setWorker] = useState<Worker>({
    id: parseInt(id || '0'),
    name: workerFromState?.name || '가나다',
    birthdate: workerFromState?.birthdate || '2021.04.03',
    workDate: '2024.08.14(수)',
    siteName: '정글리 공사',
    workHours: '-',
    notes: '-',
  });
  
  const [workHistory, setWorkHistory] = useState<WorkHistory[]>([]);

  useEffect(() => {
    // 실제로는 백엔드에서 근로자 상세 정보를 불러와야 함
    fetchWorkerDetails();
  }, [id]);

  const fetchWorkerDetails = async () => {
    try {
      // TODO: API 호출
      // const details = await getWorkerDetails(id);
      // setWorker(details);
      
      // 임시 데이터
      setWorkHistory([]);
    } catch (error) {
      console.error('근로자 상세 정보 조회 실패:', error);
    }
  };

  const handleRegisterHistory = () => {
    // 작업내역 등록 로직
    alert('작업내역을 등록해주세요.');
  };

  return (
    <Container>
      <Header />
      
      <Content>
        <PageTitle>4번 근로자 [{worker.id.toString().padStart(6, '0')} {worker.name}] 상세정보</PageTitle>
        
        <Section>
          <SectionTitle>기본정보</SectionTitle>
          <InfoGrid>
            <InfoRow>
              <InfoLabel>이름</InfoLabel>
              <InfoValue>{worker.name}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>생년월일</InfoLabel>
              <InfoValue>{worker.birthdate}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>근무일</InfoLabel>
              <InfoValue>{worker.workDate}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>현장명</InfoLabel>
              <InfoValue>{worker.siteName}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>공수</InfoLabel>
              <InfoValue>{worker.workHours}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>비고</InfoLabel>
              <InfoValue>{worker.notes}</InfoValue>
            </InfoRow>
          </InfoGrid>
        </Section>
        
        <Section>
          <SectionHeader>
            <SectionTitle>작업내역</SectionTitle>
            <RegisterButton onClick={handleRegisterHistory}>
              등록하기
            </RegisterButton>
          </SectionHeader>
          
          {workHistory.length === 0 ? (
            <EmptyState>작업 내역을 등록해주세요.</EmptyState>
          ) : (
            <HistoryList>
              {workHistory.map((history, index) => (
                <HistoryItem key={index}>
                  <HistoryDate>{history.date}</HistoryDate>
                  <HistoryContent>{history.content}</HistoryContent>
                </HistoryItem>
              ))}
            </HistoryList>
          )}
        </Section>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.background.primary};
`;

const Content = styled.div`
  padding: ${theme.spacing.md};
  
  /* PC 환경에서 최대 너비 제한 및 중앙 정렬 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    max-width: 900px;
    margin: 0 auto;
    padding: ${theme.spacing.xl};
  }
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.pageTitle.fontSize};
  font-weight: ${theme.typography.pageTitle.fontWeight};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
`;

const Section = styled.section`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.sectionTitle.fontSize};
  font-weight: ${theme.typography.sectionTitle.fontWeight};
  color: ${theme.colors.text.primary};
`;

const InfoGrid = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
  
  /* PC 환경에서 2단 그리드 레이아웃 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
  }
`;

const InfoRow = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  /* PC 환경에서 그리드 레이아웃 적용 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    border-right: 1px solid ${theme.colors.border};
    
    /* 2열 그리드에서 오른쪽 열의 테두리 제거 */
    &:nth-child(even) {
      border-right: none;
    }
    
    /* 마지막 행의 하단 테두리 제거 */
    &:nth-last-child(-n+2) {
      border-bottom: none;
    }
  }
`;

const InfoLabel = styled.div`
  flex: 0 0 120px;
  padding: 16px;
  background-color: ${theme.colors.background.secondary};
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  
  /* PC 환경에서 너비 조정 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    flex: 0 0 140px;
    padding: 18px 20px;
  }
`;

const InfoValue = styled.div`
  flex: 1;
  padding: 16px;
  font-size: 14px;
  color: ${theme.colors.text.primary};
  display: flex;
  align-items: center;
  background-color: ${theme.colors.background.primary};
  
  /* PC 환경에서 패딩 조정 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 18px 20px;
  }
`;

const RegisterButton = styled(StyledButton)`
  padding: 8px 16px;
  font-size: 14px;
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: ${theme.colors.text.secondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
`;

const HistoryList = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
`;

const HistoryItem = styled.div`
  display: flex;
  padding: 16px;
  border-bottom: 1px solid ${theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const HistoryDate = styled.div`
  flex: 0 0 120px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`;

const HistoryContent = styled.div`
  flex: 1;
  font-size: 14px;
  color: ${theme.colors.text.primary};
`;

export default WorkerDetailPage;

