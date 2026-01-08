import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { getAllWorkLogs, getSites, WorkLog, Site, markWorkLogsAsPaid } from '../../api/admin';
import { StyledSelect } from '../../components/common/StyledInput';

interface GroupedWorkLog {
  date: string;
  siteId: number;
  siteName: string;
  creatorId: number;
  creatorName: string;
  totalEffort: number;
  workLogs: WorkLog[];
  isPaid?: boolean;
  paymentDate?: string;
}

const AllWorkLogsPage: React.FC = () => {
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [groupedWorkLogs, setGroupedWorkLogs] = useState<GroupedWorkLog[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedGroupedWorkLog, setSelectedGroupedWorkLog] = useState<GroupedWorkLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 필터
  const [filterSiteId, setFilterSiteId] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  // 지급 완료 모달
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedGroupForPayment, setSelectedGroupForPayment] = useState<GroupedWorkLog | null>(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    // 초기 로딩: sites와 workLogs를 병렬로 가져오기 (최적화)
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [sitesData, workLogsData] = await Promise.all([
          getSites(),
          getAllWorkLogs({})
        ]);
        setSites(sitesData);
        setWorkLogs(workLogsData);
        groupWorkLogsByDateSiteCreator(workLogsData);
        setError('');
      } catch (err: any) {
        setError(err.message || '데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  useEffect(() => {
    // 필터 변경 시에만 workLogs 다시 로드
    if (filterSiteId || filterStartDate || filterEndDate) {
      fetchWorkLogs();
    }
  }, [filterSiteId, filterStartDate, filterEndDate]);

  const fetchWorkLogs = async () => {
    try {
      setLoading(true);
      const filters: any = {};
      if (filterSiteId) filters.siteId = parseInt(filterSiteId);
      if (filterStartDate) filters.startDate = filterStartDate;
      if (filterEndDate) filters.endDate = filterEndDate;

      const data = await getAllWorkLogs(filters);
      setWorkLogs(data);
      groupWorkLogsByDateSiteCreator(data);
      setError('');
    } catch (err: any) {
      setError(err.message || '작업일지 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const groupWorkLogsByDateSiteCreator = (logs: WorkLog[]) => {
    const grouped: { [key: string]: GroupedWorkLog } = {};
    
    logs.forEach((log: any) => {
      const date = log.workDate || new Date(log.createdAt).toLocaleDateString();
      const siteId = log.site?.id || 0;
      const creatorId = log.creator?.id || 0;
      const key = `${date}-${siteId}-${creatorId}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          date,
          siteId,
          siteName: log.site?.name || '-',
          creatorId,
          creatorName: log.creator?.name || log.creator?.phone || log.creator?.email || '이름 없음',
          totalEffort: 0,
          workLogs: [],
          isPaid: false,
          paymentDate: undefined
        };
      }
      
      grouped[key].totalEffort += log.effort || 0;
      grouped[key].workLogs.push(log);
      
      // 그룹 내 모든 로그가 지급되었는지 확인
      const isPaid = log.paymentStatus === '지급완료' || !!log.paymentDate;
      if (isPaid) {
        grouped[key].isPaid = true;
        if (log.paymentDate && !grouped[key].paymentDate) {
          grouped[key].paymentDate = log.paymentDate;
        }
      }
    });
    
    const groupedArray = Object.values(grouped).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    setGroupedWorkLogs(groupedArray);
  };

  const handleOpenPaymentModal = (group: GroupedWorkLog) => {
    setSelectedGroupForPayment(group);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setShowPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedGroupForPayment(null);
    setPaymentDate(new Date().toISOString().split('T')[0]);
  };

  const handleConfirmPayment = async () => {
    if (!selectedGroupForPayment) return;

    try {
      const workLogIds = selectedGroupForPayment.workLogs.map(log => log.id);
      await markWorkLogsAsPaid(workLogIds, paymentDate);
      
      alert('지급 완료 처리되었습니다.');
      handleClosePaymentModal();
      fetchWorkLogs(); // 목록 갱신
    } catch (err: any) {
      alert(err.message || '지급 처리에 실패했습니다.');
    }
  };

  if (loading && workLogs.length === 0) {
    return (
      <Container>
        <PageTitle>전체 작업일지</PageTitle>
        <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <PageTitle>전체 작업일지</PageTitle>
          <Subtitle>모든 작업반장이 등록한 작업일지</Subtitle>
        </div>
      </Header>

      <FilterSection>
        <FilterGroup>
          <FilterLabel>현장</FilterLabel>
          <StyledSelect
            value={filterSiteId}
            onChange={(e) => setFilterSiteId(e.target.value)}
          >
            <option value="">전체 현장</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </StyledSelect>
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>시작일</FilterLabel>
          <FilterInput
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
        </FilterGroup>

        <FilterGroup>
          <FilterLabel>종료일</FilterLabel>
          <FilterInput
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </FilterGroup>
      </FilterSection>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Table>
        <thead>
          <TableRow>
            <TableHeader>작업일</TableHeader>
            <TableHeader>현장</TableHeader>
            <TableHeader>작성자(반장)</TableHeader>
            <TableHeader>공수</TableHeader>
            <TableHeader>작업</TableHeader>
          </TableRow>
        </thead>
        <tbody>
          {groupedWorkLogs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} style={{ textAlign: 'center' }}>
                {loading ? '데이터를 불러오는 중...' : '등록된 작업일지가 없습니다.'}
              </TableCell>
            </TableRow>
          ) : (
            groupedWorkLogs.map((grouped, index) => (
              <TableRow 
                key={`${grouped.date}-${grouped.siteId}-${grouped.creatorId}-${index}`}
                $isPaid={grouped.isPaid}
              >
                <TableCell>
                  {grouped.date}
                  {grouped.isPaid && (
                    <PaidBadge>지급완료</PaidBadge>
                  )}
                </TableCell>
                <TableCell><strong>{grouped.siteName}</strong></TableCell>
                <TableCell>{grouped.creatorName}</TableCell>
                <TableCell>{grouped.totalEffort}공수</TableCell>
                <TableCell>
                  <ActionButtons>
                    <ViewButton onClick={() => setSelectedGroupedWorkLog(grouped)}>
                      상세보기
                    </ViewButton>
                    {grouped.isPaid ? (
                      <PaidButton disabled>
                        지급됨
                      </PaidButton>
                    ) : (
                      <PaymentButton onClick={() => handleOpenPaymentModal(grouped)}>
                        지급완료
                      </PaymentButton>
                    )}
                  </ActionButtons>
                </TableCell>
              </TableRow>
            ))
          )}
        </tbody>
      </Table>

      {/* 상세보기 모달 */}
      {selectedGroupedWorkLog && (
        <Modal>
          <ModalOverlay onClick={() => setSelectedGroupedWorkLog(null)} />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>작업일지 상세</ModalTitle>
              <CloseButton onClick={() => setSelectedGroupedWorkLog(null)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              <DetailRow>
                <DetailLabel>작업일:</DetailLabel>
                <DetailValue>{selectedGroupedWorkLog.date}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>현장:</DetailLabel>
                <DetailValue>{selectedGroupedWorkLog.siteName}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>작성자(반장):</DetailLabel>
                <DetailValue>{selectedGroupedWorkLog.creatorName}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>작업내용:</DetailLabel>
                <DetailValue>
                  {selectedGroupedWorkLog.workLogs[0]?.description || '-'}
                </DetailValue>
              </DetailRow>
              
              <Divider />
              
              <SectionTitle>참여 근무자 및 공수</SectionTitle>
              <WorkerDetailList>
                {(() => {
                  let totalEffort = 0;
                  let totalAmount = 0;
                  
                  return (
                    <>
                      {selectedGroupedWorkLog.workLogs.map((log: any) => {
                        const effort = log.effort || 0;
                        const dailyRate = log.dailyRate || log.worker?.dailyRate || 0;
                        const amount = effort * dailyRate;
                        totalEffort += effort;
                        totalAmount += amount;
                        
                        return (
                          <WorkerDetailCard key={log.id}>
                            <WorkerDetailHeader>
                              <WorkerName>{log.worker?.name || '이름 없음'}</WorkerName>
                            </WorkerDetailHeader>
                            <WorkerDetailBody>
                              <WorkerDetailRow>
                                <WorkerDetailLabel>공수:</WorkerDetailLabel>
                                <WorkerDetailValue>{effort}공수</WorkerDetailValue>
                              </WorkerDetailRow>
                              <WorkerDetailRow>
                                <WorkerDetailLabel>단가:</WorkerDetailLabel>
                                <WorkerDetailValue>{dailyRate.toLocaleString()}원</WorkerDetailValue>
                              </WorkerDetailRow>
                              <WorkerDetailRow>
                                <WorkerDetailLabel>금액:</WorkerDetailLabel>
                                <WorkerDetailValue $highlight>{amount.toLocaleString()}원</WorkerDetailValue>
                              </WorkerDetailRow>
                            </WorkerDetailBody>
                          </WorkerDetailCard>
                        );
                      })}
                      
                      <TotalSummary>
                        <TotalRow>
                          <TotalLabel>총 공수:</TotalLabel>
                          <TotalValue>{totalEffort}공수</TotalValue>
                        </TotalRow>
                        <TotalRow>
                          <TotalLabel>총 금액:</TotalLabel>
                          <TotalValue $highlight>{totalAmount.toLocaleString()}원</TotalValue>
                        </TotalRow>
                      </TotalSummary>
                    </>
                  );
                })()}
              </WorkerDetailList>
              
              <Divider />
              
              {/* 첨부파일 섹션 */}
              {selectedGroupedWorkLog.workLogs[0]?.attachments && 
               selectedGroupedWorkLog.workLogs[0].attachments.length > 0 && (
                <>
                  <SectionTitle>📎 첨부파일 ({selectedGroupedWorkLog.workLogs[0].attachments.length}개)</SectionTitle>
                  <AttachmentsGrid>
                    {selectedGroupedWorkLog.workLogs[0].attachments.map((attachment: any) => {
                      const isImage = attachment.mime_type?.startsWith('image/');
                      
                      return (
                        <AttachmentCard key={attachment.id}>
                          {isImage ? (
                            <AttachmentImage 
                              src={attachment.file_path} 
                              alt={attachment.filename}
                              loading="lazy"
                              onClick={() => window.open(attachment.file_path, '_blank')}
                            />
                          ) : (
                            <AttachmentFile 
                              onClick={() => window.open(attachment.file_path, '_blank')}
                            >
                              <FileIcon>📄</FileIcon>
                              <FileName>{attachment.filename}</FileName>
                            </AttachmentFile>
                          )}
                          <AttachmentInfo>
                            <AttachmentName title={attachment.filename}>
                              {attachment.filename}
                            </AttachmentName>
                            <AttachmentSize>
                              {(attachment.file_size / 1024).toFixed(1)} KB
                            </AttachmentSize>
                          </AttachmentInfo>
                        </AttachmentCard>
                      );
                    })}
                  </AttachmentsGrid>
                  <Divider />
                </>
              )}
              
              <DetailRow>
                <DetailLabel>등록일:</DetailLabel>
                <DetailValue>
                  {selectedGroupedWorkLog.workLogs[0]?.createdAt 
                    ? new Date(selectedGroupedWorkLog.workLogs[0].createdAt).toLocaleString('ko-KR')
                    : '-'
                  }
                </DetailValue>
              </DetailRow>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* 지급 완료 모달 */}
      {showPaymentModal && selectedGroupForPayment && (
        <Modal onClick={handleClosePaymentModal}>
          <PaymentModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>💰 지급 완료 처리</ModalTitle>
              <CloseButton onClick={handleClosePaymentModal}>×</CloseButton>
            </ModalHeader>
            
            <ModalBody>
              <DetailRow>
                <DetailLabel>작업일:</DetailLabel>
                <DetailValue><strong>{selectedGroupForPayment.date}</strong></DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>현장:</DetailLabel>
                <DetailValue><strong>{selectedGroupForPayment.siteName}</strong></DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>작성자(반장):</DetailLabel>
                <DetailValue>{selectedGroupForPayment.creatorName}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>총 공수:</DetailLabel>
                <DetailValue>{selectedGroupForPayment.totalEffort}공수</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>참여 인원:</DetailLabel>
                <DetailValue>{selectedGroupForPayment.workLogs.length}명</DetailValue>
              </DetailRow>
              
              <Divider />
              
              <PaymentDateSection>
                <PaymentDateLabel>지급일자:</PaymentDateLabel>
                <PaymentDateInput
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </PaymentDateSection>
              
              <PaymentWarning>
                ⚠️ 지급 완료 처리하시겠습니까?<br />
                이 작업일지에 포함된 모든 근무자의 금액이 지급된 것으로 표시됩니다.
              </PaymentWarning>
            </ModalBody>
            
            <ModalFooter>
              <CancelButton onClick={handleClosePaymentModal}>
                취소
              </CancelButton>
              <ConfirmPaymentButton onClick={handleConfirmPayment}>
                지급 완료
              </ConfirmPaymentButton>
            </ModalFooter>
          </PaymentModalContent>
        </Modal>
      )}
    </Container>
  );
};

const Container = styled.div`
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

const FilterSection = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.medium};
`;

const FilterGroup = styled.div`
  flex: 1;
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const FilterInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
`;

const TableRow = styled.tr<{ $isPaid?: boolean }>`
  background-color: ${props => props.$isPaid ? '#F5F5F5' : 'transparent'};
  opacity: ${props => props.$isPaid ? 0.7 : 1};
  
  &:hover {
    background-color: ${props => props.$isPaid ? '#EEEEEE' : theme.colors.background.secondary};
  }
`;

const TableHeader = styled.th`
  padding: 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.secondary};
  border-bottom: 1px solid ${theme.colors.border};
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: ${theme.colors.text.primary};
  border-bottom: 1px solid ${theme.colors.border};
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  font-weight: 600;
  background-color: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
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

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
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

const PaymentButton = styled.button`
  padding: 8px 16px;
  background-color: #4caf50;
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

const PaidButton = styled.button`
  padding: 8px 16px;
  background-color: #9E9E9E;
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.small};
  font-size: 13px;
  font-weight: 600;
  cursor: not-allowed;
  white-space: nowrap;
  opacity: 0.6;
`;

const PaidBadge = styled.span`
  display: inline-block;
  margin-left: 8px;
  padding: 2px 8px;
  background-color: #4caf50;
  color: white;
  border-radius: ${theme.borderRadius.small};
  font-size: 11px;
  font-weight: 600;
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
  max-width: 600px;
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

const DetailValue = styled.span<{ $highlight?: boolean }>`
  font-size: 14px;
  color: ${props => props.$highlight ? '#2196f3' : theme.colors.text.primary};
  font-weight: ${props => props.$highlight ? '600' : '400'};
  word-break: break-word;
  flex: 1;
`;

const Divider = styled.div`
  height: 1px;
  background-color: ${theme.colors.border};
  margin: ${theme.spacing.lg} 0;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
`;

const WorkerDetailList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const WorkerDetailCard = styled.div`
  background-color: ${theme.colors.background.secondary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
`;

const WorkerDetailHeader = styled.div`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: white;
  border-bottom: 1px solid ${theme.colors.border};
`;

const WorkerName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`;

const WorkerDetailBody = styled.div`
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const WorkerDetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WorkerDetailLabel = styled.span`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
`;

const WorkerDetailValue = styled.span<{ $highlight?: boolean }>`
  font-size: 14px;
  color: ${props => props.$highlight ? '#2196f3' : theme.colors.text.primary};
  font-weight: ${props => props.$highlight ? '600' : '500'};
`;

const TotalSummary = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background-color: #f0f9ff;
  border: 2px solid #2196f3;
  border-radius: ${theme.borderRadius.medium};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalLabel = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`;

const TotalValue = styled.span<{ $highlight?: boolean }>`
  font-size: 16px;
  color: ${props => props.$highlight ? '#2196f3' : theme.colors.text.primary};
  font-weight: 700;
`;

/* 지급 완료 모달 스타일 */
const PaymentModalContent = styled.div`
  background: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.large};
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
`;

const ModalFooter = styled.div`
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.md};
  background-color: ${theme.colors.background.secondary};
  border-radius: 0 0 ${theme.borderRadius.large} ${theme.borderRadius.large};
`;

const CancelButton = styled.button`
  padding: 10px 24px;
  background-color: ${theme.colors.background.primary};
  color: ${theme.colors.text.primary};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }
`;

const ConfirmPaymentButton = styled.button`
  padding: 10px 24px;
  background-color: #4caf50;
  color: white;
  border: 2px solid #4caf50;
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #45a049;
    border-color: #45a049;
  }
`;

const PaymentDateSection = styled.div`
  padding: ${theme.spacing.lg};
  background-color: #f8f9fa;
  border-radius: ${theme.borderRadius.medium};
  margin: ${theme.spacing.md} 0;
`;

const PaymentDateLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const PaymentDateInput = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const PaymentWarning = styled.div`
  padding: ${theme.spacing.md};
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: ${theme.borderRadius.medium};
  color: #856404;
  font-size: 13px;
  line-height: 1.6;
  margin-top: ${theme.spacing.md};
`;

/* 첨부파일 스타일 */
const AttachmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
`;

const AttachmentCard = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
  background-color: ${theme.colors.background.secondary};
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const AttachmentImage = styled.img`
  width: 100%;
  height: 150px;
  object-fit: cover;
  cursor: pointer;
  background-color: #f5f5f5;
  loading: lazy; /* Lazy loading for images */
  
  &:hover {
    opacity: 0.9;
  }
`;

const AttachmentFile = styled.div`
  width: 100%;
  height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: #f8f9fa;
  
  &:hover {
    background-color: #e9ecef;
  }
`;

const FileIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing.sm};
`;

const FileName = styled.div`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
  text-align: center;
  padding: 0 ${theme.spacing.sm};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AttachmentInfo = styled.div`
  padding: ${theme.spacing.sm};
  background-color: white;
`;

const AttachmentName = styled.div`
  font-size: 12px;
  color: ${theme.colors.text.primary};
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AttachmentSize = styled.div`
  font-size: 11px;
  color: ${theme.colors.text.secondary};
`;

export default AllWorkLogsPage;

