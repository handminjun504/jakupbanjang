import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { getAllExpenses, approveExpense, rejectExpense, type Expense } from '../../api/admin';

const ExpenseManagementPage: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, [filterStatus]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const filters = filterStatus === 'all' ? {} : { status: filterStatus };
      const data = await getAllExpenses(filters);
      setExpenses(data);
    } catch (error: any) {
      console.error('지출결의 목록 조회 실패:', error);
      alert(error.message || '지출결의 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (expense: Expense) => {
    if (!window.confirm(`"${expense.title}" 지출결의를 승인하시겠습니까?`)) {
      return;
    }

    try {
      await approveExpense(expense.id);
      alert('지출결의가 승인되었습니다.');
      fetchExpenses();
    } catch (error: any) {
      console.error('승인 실패:', error);
      alert(error.message || '승인에 실패했습니다.');
    }
  };

  const handleRejectClick = (expense: Expense) => {
    setSelectedExpense(expense);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleRejectModalClose = () => {
    setShowRejectModal(false);
    setSelectedExpense(null);
    setRejectReason('');
  };

  const handleRejectSubmit = async () => {
    if (!selectedExpense) return;

    if (!rejectReason.trim()) {
      alert('거절 사유를 입력해주세요.');
      return;
    }

    try {
      await rejectExpense(selectedExpense.id, rejectReason.trim());
      alert('지출결의가 거절되었습니다.');
      setShowRejectModal(false);
      setSelectedExpense(null);
      setRejectReason('');
      fetchExpenses();
    } catch (error: any) {
      console.error('거절 실패:', error);
      alert(error.message || '거절에 실패했습니다.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string; bg: string } } = {
      pending: { label: '대기중', color: '#ff9800', bg: '#fff3e0' },
      approved: { label: '승인', color: '#4caf50', bg: '#e8f5e9' },
      rejected: { label: '거절', color: '#f44336', bg: '#ffebee' }
    };
    return statusMap[status] || statusMap.pending;
  };

  const filteredExpenses = expenses;

  if (loading) {
    return (
      <Container>
        <LoadingMessage>지출결의 목록을 불러오는 중...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
        <Header>
          <Title>지출결의 관리</Title>
          <FilterContainer>
            <FilterButton
              $active={filterStatus === 'all'}
              onClick={() => setFilterStatus('all')}
            >
              전체
            </FilterButton>
            <FilterButton
              $active={filterStatus === 'pending'}
              onClick={() => setFilterStatus('pending')}
            >
              대기중
            </FilterButton>
            <FilterButton
              $active={filterStatus === 'approved'}
              onClick={() => setFilterStatus('approved')}
            >
              승인
            </FilterButton>
            <FilterButton
              $active={filterStatus === 'rejected'}
              onClick={() => setFilterStatus('rejected')}
            >
              거절
            </FilterButton>
          </FilterContainer>
        </Header>

        {filteredExpenses.length === 0 ? (
          <EmptyMessage>등록된 지출결의가 없습니다.</EmptyMessage>
        ) : (
          <TableContainer>
            <Table>
              <thead>
                <tr>
                  <Th>지출일자</Th>
                  <Th>제목</Th>
                  <Th>현장</Th>
                  <Th>금액</Th>
                  <Th>상태</Th>
                  <Th>작업</Th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => {
                  const statusInfo = getStatusBadge(expense.status);
                  return (
                    <tr key={expense.id}>
                      <Td>{expense.expenseDate}</Td>
                      <Td>{expense.title}</Td>
                      <Td>{expense.site?.name || '-'}</Td>
                      <Td $highlight>{expense.amount.toLocaleString()}원</Td>
                      <Td>
                        <StatusBadge $color={statusInfo.color} $bg={statusInfo.bg}>
                          {statusInfo.label}
                        </StatusBadge>
                      </Td>
                      <Td>
                        <ActionButtons>
                          {expense.status === 'pending' && (
                            <>
                              <SmallButton
                                $variant="approve"
                                onClick={() => handleApprove(expense)}
                              >
                                승인
                              </SmallButton>
                              <SmallButton
                                $variant="reject"
                                onClick={() => handleRejectClick(expense)}
                              >
                                거절
                              </SmallButton>
                            </>
                          )}
                          <SmallButton
                            $variant="detail"
                            onClick={() => setSelectedExpense(expense)}
                          >
                            상세
                          </SmallButton>
                        </ActionButtons>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </TableContainer>
        )}

        {selectedExpense && !showRejectModal && (
          <Modal>
            <ModalOverlay onClick={() => setSelectedExpense(null)} />
            <ModalContent>
              <ModalHeader>
                <ModalTitle>지출결의 상세</ModalTitle>
                <CloseButton onClick={() => setSelectedExpense(null)}>×</CloseButton>
              </ModalHeader>
              <ModalBody>
                <DetailRow>
                  <DetailLabel>제목:</DetailLabel>
                  <DetailValue>{selectedExpense.title}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>현장:</DetailLabel>
                  <DetailValue>{selectedExpense.site?.name || '-'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>작성자:</DetailLabel>
                  <DetailValue>{selectedExpense.creator?.email || '-'}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>지출일자:</DetailLabel>
                  <DetailValue>{selectedExpense.expenseDate}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>금액:</DetailLabel>
                  <DetailValue $highlight>{selectedExpense.amount.toLocaleString()}원</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>내용:</DetailLabel>
                  <DetailValue>{selectedExpense.content}</DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>상태:</DetailLabel>
                  <DetailValue>
                    {selectedExpense.status === 'pending' && '대기중'}
                    {selectedExpense.status === 'approved' && '승인'}
                    {selectedExpense.status === 'rejected' && '거절'}
                  </DetailValue>
                </DetailRow>
                {selectedExpense.status === 'rejected' && selectedExpense.rejectReason && (
                  <DetailRow>
                    <DetailLabel>거절 사유:</DetailLabel>
                    <DetailValue $error>{selectedExpense.rejectReason}</DetailValue>
                  </DetailRow>
                )}
                <DetailRow>
                  <DetailLabel>등록일:</DetailLabel>
                  <DetailValue>
                    {new Date(selectedExpense.createdAt).toLocaleString('ko-KR')}
                  </DetailValue>
                </DetailRow>
              </ModalBody>
            </ModalContent>
          </Modal>
        )}

        {showRejectModal && (
          <Modal>
            <ModalOverlay onClick={handleRejectModalClose} />
            <ModalContent>
              <ModalHeader>
                <ModalTitle>지출결의 거절</ModalTitle>
                <CloseButton onClick={handleRejectModalClose}>×</CloseButton>
              </ModalHeader>
              <ModalBody>
                <ModalLabel>거절 사유 *</ModalLabel>
                <ModalTextarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="거절 사유를 입력하세요"
                  rows={4}
                />
              </ModalBody>
              <ModalFooter>
                <ModalButton
                  $variant="secondary"
                  onClick={handleRejectModalClose}
                >
                  취소
                </ModalButton>
                <ModalButton
                  $variant="primary"
                  onClick={handleRejectSubmit}
                >
                  거절하기
                </ModalButton>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  padding: ${theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: ${theme.spacing.md};
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.lg};
  flex-wrap: wrap;
  gap: ${theme.spacing.md};

  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.text.primary};

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 24px;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${props => props.$active ? theme.colors.button.primary : theme.colors.border};
  background-color: ${props => props.$active ? theme.colors.button.primary : 'white'};
  color: ${props => props.$active ? theme.colors.text.primary : theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.medium};
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.button.primary};
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    flex: 1;
    min-width: 70px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
  font-size: 16px;
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
  font-size: 16px;
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

const Td = styled.td<{ $highlight?: boolean }>`
  padding: ${theme.spacing.md};
  font-size: 14px;
  color: ${props => props.$highlight ? '#2196f3' : theme.colors.text.primary};
  font-weight: ${props => props.$highlight ? '600' : '400'};
  border-bottom: 1px solid ${theme.colors.border};
  white-space: nowrap;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`;

const SmallButton = styled.button<{ $variant: 'approve' | 'reject' | 'detail' }>`
  padding: 6px 12px;
  border: none;
  border-radius: ${theme.borderRadius.small};
  background-color: ${props => {
    switch (props.$variant) {
      case 'approve': return '#4caf50';
      case 'reject': return '#f44336';
      case 'detail': return '#2196f3';
      default: return '#ccc';
    }
  }};
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }
`;

const StatusBadge = styled.span<{ $color: string; $bg: string }>`
  padding: 6px 12px;
  border-radius: ${theme.borderRadius.medium};
  background-color: ${props => props.$bg};
  color: ${props => props.$color};
  font-size: 14px;
  font-weight: 600;
  display: inline-block;
  white-space: nowrap;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 12px;
    padding: 4px 10px;
  }
`;

const DetailRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
  align-items: flex-start;
`;

const DetailLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
  min-width: 100px;
  flex-shrink: 0;
`;

const DetailValue = styled.span<{ $highlight?: boolean; $error?: boolean }>`
  font-size: 14px;
  color: ${props => props.$error ? '#f44336' : props.$highlight ? '#2196f3' : theme.colors.text.primary};
  font-weight: ${props => props.$highlight ? '600' : '400'};
  word-break: break-word;
  flex: 1;
`;

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
  max-width: 500px;
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

const ModalLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing.sm};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.button.primary};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
  background-color: ${theme.colors.background.secondary};
`;

const ModalButton = styled.button<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${props => props.$variant === 'primary' ? '#f44336' : theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  background-color: ${props => props.$variant === 'primary' ? '#f44336' : 'white'};
  color: ${props => props.$variant === 'primary' ? 'white' : theme.colors.text.primary};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

export default ExpenseManagementPage;

