import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import apiClient from '../../api/axios';

interface Foreman {
  id: number;
  name?: string;
  email: string;
  phone?: string;
  role: string;
  dailyRate?: number;
  createdAt: string;
}

interface Worker {
  id: number;
  name: string;
  rrn: string; // 복호화된 전체 주민번호
  rrnDisplay?: string; // 마스킹된 주민번호 (예비용)
  phoneNumber?: string;
  dailyRate?: number;
  createdAt: string;
}

const AllWorkersListPage: React.FC = () => {
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [selectedForeman, setSelectedForeman] = useState<Foreman | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingForemanId, setEditingForemanId] = useState<number | null>(null);
  const [editDailyRate, setEditDailyRate] = useState('');

  useEffect(() => {
    fetchForemen();
  }, []);

  const fetchForemen = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/admin/workers');
      const data = response.data.data || response.data;
      // 작업반장만 필터링
      const foremanList = Array.isArray(data) ? data.filter((w: any) => w.role === 'foreman') : [];
      setForemen(foremanList);
      setError('');
    } catch (err: any) {
      setError(err.message || '작업반장 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewWorkers = async (foreman: Foreman) => {
    try {
      setWorkersLoading(true);
      setSelectedForeman(foreman);
      // 해당 작업반장이 등록한 근무자 목록 조회
      const response = await apiClient.get(`/admin/foremen/${foreman.id}/workers`);
      const data = response.data.data || response.data;
      setWorkers(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('근무자 목록 조회 실패:', err);
      setWorkers([]);
    } finally {
      setWorkersLoading(false);
    }
  };

  const handleEditDailyRate = (foreman: Foreman) => {
    setEditingForemanId(foreman.id);
    setEditDailyRate((foreman.dailyRate || 0).toString());
  };

  const handleCancelEdit = () => {
    setEditingForemanId(null);
    setEditDailyRate('');
  };

  const handleSaveDailyRate = async (foremanId: number) => {
    try {
      const numericRate = parseInt(editDailyRate.replace(/,/g, ''));
      if (isNaN(numericRate) || numericRate < 0) {
        alert('올바른 단가를 입력해주세요.');
        return;
      }

      await apiClient.put(`/admin/foremen/${foremanId}/dailyrate`, {
        dailyRate: numericRate
      });

      // 목록 새로고침
      await fetchForemen();
      setEditingForemanId(null);
      setEditDailyRate('');
      alert('단가가 수정되었습니다.');
    } catch (err: any) {
      alert(err.response?.data?.message || '단가 수정에 실패했습니다.');
    }
  };

  const handleDailyRateChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue) {
      setEditDailyRate(parseInt(numericValue).toLocaleString());
    } else {
      setEditDailyRate('');
    }
  };

  if (loading) {
    return (
      <Container>
        <PageTitle>작업반장 및 근무자 관리</PageTitle>
        <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <PageTitle>작업반장 및 근무자 관리</PageTitle>
          <Subtitle>등록된 작업반장과 담당 근무자 관리</Subtitle>
        </div>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <StatsCard>
        <StatItem>
          <StatIcon>👷</StatIcon>
          <StatInfo>
            <StatValue>{foremen.length}</StatValue>
            <StatLabel>총 작업반장</StatLabel>
          </StatInfo>
        </StatItem>
      </StatsCard>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>이름</Th>
              <Th>전화번호</Th>
              <Th>가입일</Th>
              <Th>단가</Th>
              <Th>작업</Th>
            </tr>
          </thead>
          <tbody>
            {foremen.length === 0 ? (
              <tr>
                <Td colSpan={6} style={{ textAlign: 'center' }}>
                  등록된 작업반장이 없습니다.
                </Td>
              </tr>
            ) : (
              foremen.map((foreman) => (
                <tr key={foreman.id}>
                  <Td>{foreman.id}</Td>
                  <Td><strong>{foreman.name || '-'}</strong></Td>
                  <Td>{foreman.phone || '-'}</Td>
                  <Td>{new Date(foreman.createdAt).toLocaleDateString('ko-KR')}</Td>
                  <Td>
                    {editingForemanId === foreman.id ? (
                      <DailyRateEditRow>
                        <DailyRateInput
                          type="text"
                          value={editDailyRate}
                          onChange={(e) => handleDailyRateChange(e.target.value)}
                          placeholder="단가 입력"
                        />
                        <DailyRateUnit>원</DailyRateUnit>
                        <SaveButton onClick={() => handleSaveDailyRate(foreman.id)}>
                          저장
                        </SaveButton>
                        <CancelButton onClick={handleCancelEdit}>
                          취소
                        </CancelButton>
                      </DailyRateEditRow>
                    ) : (
                      <DailyRateRow>
                        <span>{(foreman.dailyRate || 0).toLocaleString()}원</span>
                        <EditButton onClick={() => handleEditDailyRate(foreman)}>
                          수정
                        </EditButton>
                      </DailyRateRow>
                    )}
                  </Td>
                  <Td>
                    <ViewButton onClick={() => handleViewWorkers(foreman)}>
                      담당 근무자 보기
                    </ViewButton>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      {/* 근무자 상세 모달 */}
      {selectedForeman && (
        <Modal>
          <ModalOverlay onClick={() => setSelectedForeman(null)} />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {selectedForeman.name || selectedForeman.phone || selectedForeman.email}님의 담당 근무자
              </ModalTitle>
              <CloseButton onClick={() => setSelectedForeman(null)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              {workersLoading ? (
                <LoadingMessage>불러오는 중...</LoadingMessage>
              ) : workers.length === 0 ? (
                <EmptyMessage>등록된 근무자가 없습니다.</EmptyMessage>
              ) : (
                <WorkerTable>
                  <thead>
                    <tr>
                      <WorkerTh>이름</WorkerTh>
                      <WorkerTh>주민번호</WorkerTh>
                      <WorkerTh>입사일</WorkerTh>
                      <WorkerTh>단가</WorkerTh>
                    </tr>
                  </thead>
                  <tbody>
                    {workers.map((worker) => (
                      <tr key={worker.id}>
                        <WorkerTd><strong>{worker.name}</strong></WorkerTd>
                        <WorkerTd>
                          {worker.rrn 
                            ? worker.rrn.length === 13 
                              ? `${worker.rrn.substring(0, 6)}-${worker.rrn.substring(6)}` 
                              : worker.rrn
                            : '-'}
                        </WorkerTd>
                        <WorkerTd>{new Date(worker.createdAt).toLocaleDateString('ko-KR')}</WorkerTd>
                        <WorkerTd $highlight>
                          {worker.dailyRate?.toLocaleString()}원
                        </WorkerTd>
                      </tr>
                    ))}
                  </tbody>
                </WorkerTable>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  padding: ${theme.spacing.lg};
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${theme.colors.text.secondary};
`;

const StatsCard = styled.div`
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
`;

const StatIcon = styled.div`
  font-size: 48px;
`;

const StatInfo = styled.div``;

const StatValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background-color: white;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
`;

const Th = styled.th`
  padding: ${theme.spacing.md};
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.secondary};
  border-bottom: 2px solid ${theme.colors.border};
  white-space: nowrap;
`;

const Td = styled.td`
  padding: ${theme.spacing.md};
  font-size: 14px;
  color: ${theme.colors.text.primary};
  border-bottom: 1px solid ${theme.colors.border};
  white-space: nowrap;
`;

const ViewButton = styled.button`
  padding: 8px 16px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.small};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }
`;

const DailyRateRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  
  span {
    font-weight: 600;
    color: #2196f3;
  }
`;

const DailyRateEditRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const DailyRateInput = styled.input`
  width: 120px;
  padding: 6px 10px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  font-size: 13px;
  text-align: right;
  
  &:focus {
    outline: none;
    border-color: #2196f3;
  }
`;

const DailyRateUnit = styled.span`
  font-size: 13px;
  color: ${theme.colors.text.secondary};
`;

const EditButton = styled.button`
  padding: 4px 12px;
  background-color: white;
  color: #2196f3;
  border: 1px solid #2196f3;
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #2196f3;
    color: white;
  }
`;

const SaveButton = styled.button`
  padding: 4px 12px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }
`;

const CancelButton = styled.button`
  padding: 4px 12px;
  background-color: #9e9e9e;
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  color: #e74c3c;
  background-color: #ffeaea;
  border-radius: ${theme.borderRadius.medium};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

/* 모달 스타일 */
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
`;

const ModalContent = styled.div`
  position: relative;
  background-color: white;
  border-radius: ${theme.borderRadius.medium};
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.border};
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 32px;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: ${theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
`;

const WorkerTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: white;
`;

const WorkerTh = styled.th`
  padding: ${theme.spacing.md};
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.secondary};
  border-bottom: 2px solid ${theme.colors.border};
`;

const WorkerTd = styled.td<{ $highlight?: boolean }>`
  padding: ${theme.spacing.md};
  font-size: 14px;
  color: ${props => props.$highlight ? '#2196f3' : theme.colors.text.primary};
  font-weight: ${props => props.$highlight ? '600' : '400'};
  border-bottom: 1px solid ${theme.colors.border};
`;

export default AllWorkersListPage;
