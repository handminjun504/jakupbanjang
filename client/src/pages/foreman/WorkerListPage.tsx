import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Tabs from '../../components/common/Tabs';
import { theme } from '../../styles/theme';
import { getWorkersBySite, deleteWorker } from '../../api/foreman';
import { maskRRN } from '../../utils/maskRRN';

interface Worker {
  id: number;
  name: string;
  rrn?: string; // 복호화된 전체 주민번호
  phoneNumber?: string;
  dailyRate?: number;
  remarks?: string;
  status: string;
  createdAt: string;
}

const WorkerListPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('workers');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'work-logs', label: '작업일지' },
    { id: 'expense', label: '지출비용' },
    { id: 'workers', label: '근무자 리스트' },
  ];

  useEffect(() => {
    fetchWorkers();
  }, []);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      setError('');
      const workers = await getWorkersBySite();
      setWorkers(workers);
    } catch (error: any) {
      console.error('근무자 조회 실패:', error);
      setError(error.message || '근무자 목록을 불러오는데 실패했습니다.');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (workerId: number, workerName: string) => {
    if (!window.confirm(`"${workerName}" 근무자를 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deleteWorker(workerId);
      alert('근무자가 삭제되었습니다.');
      fetchWorkers(); // 목록 새로고침
    } catch (error: any) {
      alert(error.message || '근무자 삭제에 실패했습니다.');
    }
  };

  const handleEdit = (workerId: number) => {
    navigate(`/foreman/edit-worker/${workerId}`);
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'work-logs') {
      navigate('/foreman/worklogs');
    } else if (tabId === 'expense') {
      navigate('/foreman/expense');
    }
  };

  const handleAddWorker = () => {
    navigate('/foreman/add-worker');
  };

  return (
    <Container>
      <Header />
      
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      
      <Content>
        <PageHeader>
          <PageTitle>근무자 관리</PageTitle>
          <AddWorkerButton onClick={handleAddWorker}>
            + 근무자 등록
          </AddWorkerButton>
        </PageHeader>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        {loading ? (
          <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
        ) : workers.length === 0 ? (
          <EmptyMessage>
            <EmptyIcon>👷</EmptyIcon>
            <EmptyText>등록된 근무자가 없습니다.</EmptyText>
            <EmptySubText>위의 "+ 근무자 등록" 버튼을 눌러 첫 근무자를 추가해보세요.</EmptySubText>
          </EmptyMessage>
        ) : (
          <>
            {/* 데스크톱 테이블 뷰 */}
            <TableWrapper>
              <Table>
                <thead>
                  <tr>
                    <Th>이름</Th>
                    <Th>주민번호</Th>
                    <Th>연락처</Th>
                    <Th>단가</Th>
                    <Th>비고</Th>
                    <Th>등록일</Th>
                    <Th>관리</Th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((worker) => (
                    <tr key={worker.id}>
                      <Td>{worker.name}</Td>
                      <Td>
                        {maskRRN(worker.rrn) || '-'}
                      </Td>
                      <Td>{worker.phoneNumber || '-'}</Td>
                      <Td>{worker.dailyRate ? `${worker.dailyRate.toLocaleString()}원` : '-'}</Td>
                      <Td>{worker.remarks || '-'}</Td>
                      <Td>{new Date(worker.createdAt).toLocaleDateString()}</Td>
                      <Td>
                        <ActionButtons>
                          <EditButton onClick={() => handleEdit(worker.id)}>
                            수정
                          </EditButton>
                          <DeleteButton onClick={() => handleDelete(worker.id, worker.name)}>
                            삭제
                          </DeleteButton>
                        </ActionButtons>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableWrapper>

            {/* 모바일 카드 뷰 */}
            <MobileCards>
              {workers.map((worker) => (
                <WorkerCard key={worker.id}>
                  <CardHeader>
                    <WorkerName>{worker.name}</WorkerName>
                  </CardHeader>
                  
                  <CardBody>
                    <CardRow>
                      <CardLabel>주민번호</CardLabel>
                      <CardValue>
                        {maskRRN(worker.rrn) || '-'}
                      </CardValue>
                    </CardRow>
                    
                    <CardRow>
                      <CardLabel>연락처</CardLabel>
                      <CardValue>{worker.phoneNumber || '-'}</CardValue>
                    </CardRow>
                    
                    <CardRow>
                      <CardLabel>단가</CardLabel>
                      <CardValue>{worker.dailyRate ? `${worker.dailyRate.toLocaleString()}원` : '-'}</CardValue>
                    </CardRow>
                    
                    {worker.remarks && (
                      <CardRow>
                        <CardLabel>비고</CardLabel>
                        <CardValue>{worker.remarks}</CardValue>
                      </CardRow>
                    )}
                    
                    <CardRow>
                      <CardLabel>등록일</CardLabel>
                      <CardValue>{new Date(worker.createdAt).toLocaleDateString()}</CardValue>
                    </CardRow>
                  </CardBody>
                  
                  <CardFooter>
                    <EditButton onClick={() => handleEdit(worker.id)}>
                      수정
                    </EditButton>
                    <DeleteButton onClick={() => handleDelete(worker.id, worker.name)}>
                      삭제
                    </DeleteButton>
                  </CardFooter>
                </WorkerCard>
              ))}
            </MobileCards>
          </>
        )}
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
  max-width: 1400px;
  margin: 0 auto;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.xl};
  }
`;

// 데스크톱 테이블 (768px 이상에서만 표시)
const TableWrapper = styled.div`
  display: none;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    display: block;
    background-color: ${theme.colors.background.secondary};
    border-radius: ${theme.borderRadius.medium};
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

// 모바일 카드 (768px 미만에서만 표시)
const MobileCards = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

const WorkerCard = styled.div`
  background-color: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.primary};
  border-bottom: 1px solid ${theme.colors.border};
`;

const WorkerName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CardBody = styled.div`
  padding: ${theme.spacing.md};
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const CardLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
`;

const CardValue = styled.span`
  font-size: 14px;
  color: ${theme.colors.text.primary};
  text-align: right;
  word-break: break-word;
  max-width: 60%;
`;

const CardFooter = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.primary};
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: flex-end;
`;

const PageHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 24px;
  }
`;

const AddWorkerButton = styled.button`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.accent};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s;
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
    padding: ${theme.spacing.sm} ${theme.spacing.lg};
    font-size: 15px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  padding: ${theme.spacing.md};
  text-align: left;
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.primary};
  border-bottom: 2px solid ${theme.colors.border};
`;

const Td = styled.td`
  padding: ${theme.spacing.md};
  font-size: 14px;
  color: ${theme.colors.text.primary};
  border-bottom: 1px solid ${theme.colors.border};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
`;

const EditButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.small};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #1976d2;
  }
`;

const DeleteButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.small};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #d32f2f;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  background-color: #ffeaea;
  border: 1px solid #ffcdd2;
  border-radius: ${theme.borderRadius.medium};
  color: #c62828;
  text-align: center;
`;

const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${theme.spacing.md};
`;

const EmptyText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const EmptySubText = styled.p`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
`;

export default WorkerListPage;

