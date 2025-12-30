import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Tabs from '../components/common/Tabs';
import { StyledInput, StyledSelect } from '../components/common/StyledInput';
import { theme } from '../styles/theme';
import { getTasks, Task } from '../api/tasks';
import { getWorkersBySite } from '../api/foreman';

interface Worker {
  id: number;
  name: string;
  phoneNumber?: string;
  dailyRate?: number;
  remarks?: string;
  status: string;
  createdAt: string;
}

const TaskListPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('workers');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
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
      console.error('근무자 목록 조회 실패:', error);
      setError(error.message || '근무자 목록을 불러오는데 실패했습니다.');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'expense') {
      navigate('/foreman/select-site');
    } else if (tabId === 'work-logs') {
      navigate('/foreman/select-site');
    } else if (tabId === 'workers') {
      navigate('/foreman/workers');
    }
  };

  const handleWorkerClick = (worker: Worker) => {
    navigate(`/worker/${worker.id}`, { state: { worker } });
  };

  const handleTaskEntry = (e: React.MouseEvent, workerId: number) => {
    e.stopPropagation();
    navigate(`/task-entry/${workerId}`);
  };

  return (
    <Container>
      <Header />
      
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      
      <Content>
        <SiteHeader>
          <PageTitle>근무자 리스트</PageTitle>
        </SiteHeader>
        
        <FilterSection>
          <Label>근무일</Label>
          <DateInput
            type="date"
            value={workDate}
            onChange={(e) => setWorkDate(e.target.value)}
          />
        </FilterSection>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <WorkerTable>
          <TableHeader>
            <HeaderCell width="30%">이름</HeaderCell>
            <HeaderCell width="35%">연락처</HeaderCell>
            <HeaderCell width="35%">단가</HeaderCell>
          </TableHeader>
          
          <TableBody>
            {loading ? (
              <EmptyRow>
                <td colSpan={3}>로딩 중...</td>
              </EmptyRow>
            ) : workers.length === 0 ? (
              <EmptyRow>
                <td colSpan={3}>
                  등록된 근무자가 없습니다
                  <br />
                  <AddWorkerLink onClick={() => navigate('/foreman/add-worker')}>
                    근무자 추가하기 →
                  </AddWorkerLink>
                </td>
              </EmptyRow>
            ) : (
              workers.map((worker) => (
                <TableRow key={worker.id} onClick={() => handleWorkerClick(worker)}>
                  <DataCell width="30%">{worker.name}</DataCell>
                  <DataCell width="35%">
                    {worker.phoneNumber || '-'}
                  </DataCell>
                  <DataCell width="35%">
                    {worker.dailyRate ? `${worker.dailyRate.toLocaleString()}원` : '-'}
                  </DataCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </WorkerTable>
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
    max-width: ${theme.maxWidth.content};
    margin: 0 auto;
    padding: ${theme.spacing.xl};
  }
`;

const SiteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  gap: ${theme.spacing.md};
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.pageTitle.fontSize};
  font-weight: ${theme.typography.pageTitle.fontWeight};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const ChangeSiteButton = styled.button`
  padding: 8px 16px;
  background: white;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  color: ${theme.colors.text.primary};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${theme.colors.text.primary};
  }
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background-color: #ffeaea;
  border-radius: ${theme.borderRadius.medium};
  color: #e74c3c;
  font-size: 14px;
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
`;

const AddWorkerLink = styled.button`
  margin-top: 12px;
  color: ${theme.colors.text.primary};
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  text-decoration: underline;

  &:hover {
    opacity: 0.7;
  }
`;

const FilterSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const DateInput = styled(StyledInput)`
  max-width: 300px;
`;

const WorkerTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  /* PC 환경에서 테이블 스타일 개선 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    border-radius: ${theme.borderRadius.medium};
    overflow: hidden;
  }
`;

const TableHeader = styled.thead`
  background-color: ${theme.colors.background.secondary};
`;

const HeaderCell = styled.th<{ width?: string }>`
  padding: 12px 16px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  border-bottom: 1px solid ${theme.colors.border};
  width: ${props => props.width || 'auto'};
  
  /* PC 환경에서 패딩 증가 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 16px 24px;
    font-size: 15px;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  cursor: pointer;
  
  &:hover {
    background-color: #F8F9FA;
  }
`;

const EmptyRow = styled.tr`
  td {
    padding: 40px;
    text-align: center;
    color: ${theme.colors.text.secondary};
  }
`;

const DataCell = styled.td<{ width?: string }>`
  padding: 16px;
  text-align: center;
  font-size: 14px;
  color: ${theme.colors.text.primary};
  border-bottom: 1px solid ${theme.colors.border};
  width: ${props => props.width || 'auto'};
  
  /* PC 환경에서 패딩 증가 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 20px 24px;
    font-size: 15px;
  }
`;

const InputButton = styled.button`
  background-color: ${theme.colors.accent};
  color: ${theme.colors.text.primary};
  padding: 6px 16px;
  border-radius: ${theme.borderRadius.small};
  font-size: 13px;
  font-weight: 600;
  
  &:hover {
    opacity: 0.8;
  }
  
  /* PC 환경에서 버튼 크기 조정 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 8px 24px;
    font-size: 14px;
  }
`;

export default TaskListPage;

