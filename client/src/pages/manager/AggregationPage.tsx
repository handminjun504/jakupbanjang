import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { 
  getAggregationData, 
  getSites, 
  getAllWorkers,
  AggregationFilters,
  AggregationData,
  Site
} from '../../api/admin';
import { getWorkersBySite } from '../../api/foreman';
import { StyledSelect } from '../../components/common/StyledInput';

interface GroupedWorkLog {
  type: 'worklog';
  date: string;
  site?: { id: number; name: string; address?: string };
  creator?: { id: number; name?: string; email: string; phone?: string; role: string };
  totalEffort: number;
  totalAmount: number;
  description?: string;
  paymentStatus: string;
  items: any[]; // 개별 작업일지 항목들
}

const AggregationPage: React.FC = () => {
  const [aggregationData, setAggregationData] = useState<AggregationData | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [foremen, setForemen] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [displayData, setDisplayData] = useState<any[]>([]);

  // 3개월 전 날짜 계산
  const getThreeMonthsAgo = () => {
    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    return threeMonthsAgo.toISOString().split('T')[0];
  };

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  };

  // 필터 상태
  const [filters, setFilters] = useState<AggregationFilters>({
    type: 'all',
    startDate: getThreeMonthsAgo(), // 3개월 전
    endDate: getToday(), // 오늘
    paymentStatus: 'all'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAggregationData();
  }, [filters]);

  const fetchInitialData = async () => {
    try {
      const [sitesData, foremenData] = await Promise.all([
        getSites(),
        getAllWorkers()
      ]);
      setSites(sitesData);
      setForemen(foremenData);
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  const fetchAggregationData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAggregationData(filters);
      setAggregationData(data);
      
      // 작업일지 그룹화 및 지출결의 합치기
      groupAndMergeData(data);
    } catch (err: any) {
      setError(err.message || '집계 데이터 조회에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const groupAndMergeData = (data: AggregationData) => {
    // 작업일지 그룹화 (날짜 + 현장 + 반장 기준)
    const workLogGroups: { [key: string]: GroupedWorkLog } = {};
    
    data.workLogs.forEach((item: any) => {
      const key = `${item.date}-${item.site?.id}-${item.creator?.id}`;
      
      if (!workLogGroups[key]) {
        workLogGroups[key] = {
          type: 'worklog',
          date: item.date,
          site: item.site,
          creator: item.creator,
          totalEffort: 0,
          totalAmount: 0,
          description: item.description || '',
          paymentStatus: item.paymentStatus,
          items: []
        };
      }
      
      workLogGroups[key].items.push(item);
      workLogGroups[key].totalEffort += item.effort || 0;
      workLogGroups[key].totalAmount += item.amount || 0;
      
      // 지급완료가 하나라도 있으면 지급완료로 표시
      if (item.paymentStatus === '지급완료') {
        workLogGroups[key].paymentStatus = '지급완료';
      }
    });
    
    // 그룹화된 작업일지와 지출결의 합치기
    const grouped = Object.values(workLogGroups);
    const expenses = data.expenses.map(exp => ({ ...exp, type: 'expense' as const }));
    const merged = [...grouped, ...expenses];
    
    // 날짜순 정렬 (최신순)
    merged.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setDisplayData(merged);
  };

  const handleFilterChange = (key: keyof AggregationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const handleReset = () => {
    setFilters({
      type: 'all',
      startDate: getThreeMonthsAgo(), // 3개월 전
      endDate: getToday(), // 오늘
      paymentStatus: 'all'
    });
  };

  return (
    <Container>
      <Header>
        <div>
          <PageTitle>📊 집계</PageTitle>
          <Subtitle>작업일지와 지출결의를 한눈에 확인하세요</Subtitle>
        </div>
      </Header>

      {/* 필터 섹션 */}
      <FilterSection>
        <FilterRow>
          <FilterGroup>
            <FilterLabel>유형</FilterLabel>
            <StyledSelect
              value={filters.type || 'all'}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="all">전체</option>
              <option value="worklog">작업일지</option>
              <option value="expense">지출결의</option>
            </StyledSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>시작일</FilterLabel>
            <DateInput
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
            />
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>종료일</FilterLabel>
            <DateInput
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
            />
          </FilterGroup>
        </FilterRow>

        <FilterRow>
          <FilterGroup>
            <FilterLabel>현장</FilterLabel>
            <StyledSelect
              value={filters.siteId || ''}
              onChange={(e) => handleFilterChange('siteId', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">전체 현장</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </StyledSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>반장</FilterLabel>
            <StyledSelect
              value={filters.creatorId || ''}
              onChange={(e) => handleFilterChange('creatorId', e.target.value ? parseInt(e.target.value) : undefined)}
            >
              <option value="">전체 반장</option>
              {foremen.map(foreman => (
                <option key={foreman.id} value={foreman.id}>
                  {foreman.name || foreman.phone || foreman.email}
                </option>
              ))}
            </StyledSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel>지급 상태</FilterLabel>
            <StyledSelect
              value={filters.paymentStatus || 'all'}
              onChange={(e) => handleFilterChange('paymentStatus', e.target.value)}
            >
              <option value="all">전체</option>
              <option value="지급완료">지급완료</option>
              <option value="미지급">미지급</option>
            </StyledSelect>
          </FilterGroup>

          <FilterGroup>
            <ResetButton onClick={handleReset}>
              🔄 초기화
            </ResetButton>
          </FilterGroup>
        </FilterRow>
      </FilterSection>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {loading ? (
        <LoadingMessage>집계 데이터를 불러오는 중...</LoadingMessage>
      ) : aggregationData ? (
        <>
          {/* 집계 요약 카드 */}
          <SummarySection>
            <SummaryCard $highlight>
              <CardIcon>💰</CardIcon>
              <CardContent>
                <CardLabel>총 금액</CardLabel>
                <CardValue $color="#667eea">{aggregationData.summary.totalAmount.toLocaleString()}원</CardValue>
                <CardSubtext>{aggregationData.summary.totalCount}건</CardSubtext>
              </CardContent>
            </SummaryCard>

            <SummaryCard>
              <CardIcon>📋</CardIcon>
              <CardContent>
                <CardLabel>작업일지</CardLabel>
                <CardValue $color="#2196f3">{aggregationData.summary.workLogAmount.toLocaleString()}원</CardValue>
                <CardSubtext>{aggregationData.summary.workLogCount}건</CardSubtext>
              </CardContent>
            </SummaryCard>

            <SummaryCard>
              <CardIcon>💸</CardIcon>
              <CardContent>
                <CardLabel>지출결의</CardLabel>
                <CardValue $color="#f57c00">{aggregationData.summary.expenseAmount.toLocaleString()}원</CardValue>
                <CardSubtext>{aggregationData.summary.expenseCount}건</CardSubtext>
              </CardContent>
            </SummaryCard>

            <SummaryCard $status="paid">
              <CardIcon>✅</CardIcon>
              <CardContent>
                <CardLabel>지급완료</CardLabel>
                <CardValue $color="#4caf50">{aggregationData.summary.paidAmount.toLocaleString()}원</CardValue>
              </CardContent>
            </SummaryCard>

            <SummaryCard $status="unpaid">
              <CardIcon>⏳</CardIcon>
              <CardContent>
                <CardLabel>미지급</CardLabel>
                <CardValue $color="#ff9800">{aggregationData.summary.unpaidAmount.toLocaleString()}원</CardValue>
              </CardContent>
            </SummaryCard>
          </SummarySection>

          {/* 상세 내역 테이블 */}
          <TableSection>
            <TableHeader>
              <TableTitle>상세 내역</TableTitle>
              <TableCount>총 {displayData.length}건</TableCount>
            </TableHeader>

            {displayData.length === 0 ? (
              <EmptyState>
                <EmptyIcon>📭</EmptyIcon>
                <EmptyText>조회된 데이터가 없습니다.</EmptyText>
                <EmptySubtext>필터 조건을 변경해보세요.</EmptySubtext>
              </EmptyState>
            ) : (
              <TableWrapper>
                <Table>
                  <thead>
                    <TableRow>
                      <Th>유형</Th>
                      <Th>일자</Th>
                      <Th>현장</Th>
                      <Th>작성자(반장)</Th>
                      <Th>참여인원/제목</Th>
                      <Th>공수/내용</Th>
                      <Th>금액</Th>
                      <Th>지급상태</Th>
                      <Th>작업</Th>
                    </TableRow>
                  </thead>
                  <tbody>
                    {displayData.map((item: any, index) => (
                      <TableRow key={`${item.type}-${index}`}>
                        <Td>
                          <TypeBadge $type={item.type}>
                            {item.type === 'worklog' ? '📋 작업일지' : '💸 지출결의'}
                          </TypeBadge>
                        </Td>
                        <Td>{item.date}</Td>
                        <Td><strong>{item.site?.name || '-'}</strong></Td>
                        <Td>{item.creator?.name || item.creator?.phone || '-'}</Td>
                        <Td>
                          {item.type === 'worklog' 
                            ? `${item.items?.length || 0}명`
                            : item.title || '-'
                          }
                        </Td>
                        <Td>
                          {item.type === 'worklog'
                            ? `${item.totalEffort || 0}공수`
                            : (item.content || '-')
                          }
                        </Td>
                        <Td>
                          <AmountText>{(item.totalAmount || item.amount || 0).toLocaleString()}원</AmountText>
                        </Td>
                        <Td>
                          <StatusBadge $status={item.paymentStatus || item.status}>
                            {item.paymentStatus === '지급완료' || item.status === 'approved' ? '✅ 지급완료' : '⏳ 미지급'}
                          </StatusBadge>
                        </Td>
                        <Td>
                          <ViewButton onClick={() => setSelectedItem(item)}>
                            상세보기
                          </ViewButton>
                        </Td>
                      </TableRow>
                    ))}
                  </tbody>
                </Table>
              </TableWrapper>
            )}
          </TableSection>
        </>
      ) : null}

      {/* 상세보기 모달 */}
      {selectedItem && (
        <Modal>
          <ModalOverlay onClick={() => setSelectedItem(null)} />
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {selectedItem.type === 'worklog' ? '📋 작업일지 상세' : '💸 지출결의 상세'}
              </ModalTitle>
              <CloseButton onClick={() => setSelectedItem(null)}>×</CloseButton>
            </ModalHeader>
            <ModalBody>
              {selectedItem.type === 'worklog' ? (
                <>
                  <DetailRow>
                    <DetailLabel>작업일:</DetailLabel>
                    <DetailValue><strong>{selectedItem.date}</strong></DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>현장:</DetailLabel>
                    <DetailValue><strong>{selectedItem.site?.name || '-'}</strong></DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>작성자(반장):</DetailLabel>
                    <DetailValue>{selectedItem.creator?.name || selectedItem.creator?.phone || '-'}</DetailValue>
                  </DetailRow>
                  
                  <Divider />
                  
                  <DetailRow>
                    <DetailLabel>작업내용:</DetailLabel>
                    <DetailValue>{selectedItem.description || '-'}</DetailValue>
                  </DetailRow>
                  
                  <Divider />
                  
                  <SectionTitle>참여 근무자 및 공수</SectionTitle>
                  <WorkerDetailList>
                    {selectedItem.items?.map((item: any, idx: number) => (
                      <WorkerDetailCard key={idx}>
                        <WorkerDetailHeader>
                          <WorkerName>{item.worker?.name || '이름 없음'}</WorkerName>
                        </WorkerDetailHeader>
                        <WorkerDetailBody>
                          <WorkerDetailRow>
                            <WorkerDetailLabel>공수:</WorkerDetailLabel>
                            <WorkerDetailValue>{item.effort || 0}공수</WorkerDetailValue>
                          </WorkerDetailRow>
                          <WorkerDetailRow>
                            <WorkerDetailLabel>단가:</WorkerDetailLabel>
                            <WorkerDetailValue>{(item.dailyRate || 0).toLocaleString()}원</WorkerDetailValue>
                          </WorkerDetailRow>
                          <WorkerDetailRow>
                            <WorkerDetailLabel>금액:</WorkerDetailLabel>
                            <WorkerDetailValue $highlight>{(item.amount || 0).toLocaleString()}원</WorkerDetailValue>
                          </WorkerDetailRow>
                        </WorkerDetailBody>
                      </WorkerDetailCard>
                    ))}
                    
                    <TotalSummary>
                      <TotalRow>
                        <TotalLabel>총 공수:</TotalLabel>
                        <TotalValue>{selectedItem.totalEffort || 0}공수</TotalValue>
                      </TotalRow>
                      <TotalRow>
                        <TotalLabel>총 금액:</TotalLabel>
                        <TotalValue $highlight>{(selectedItem.totalAmount || 0).toLocaleString()}원</TotalValue>
                      </TotalRow>
                    </TotalSummary>
                  </WorkerDetailList>
                  
                  <Divider />
                  
                  <DetailRow>
                    <DetailLabel>지급상태:</DetailLabel>
                    <DetailValue>
                      <StatusBadge $status={selectedItem.paymentStatus}>
                        {selectedItem.paymentStatus === '지급완료' ? '✅ 지급완료' : '⏳ 미지급'}
                      </StatusBadge>
                    </DetailValue>
                  </DetailRow>
                  {selectedItem.items?.[0]?.paymentDate && (
                    <DetailRow>
                      <DetailLabel>지급일:</DetailLabel>
                      <DetailValue>{selectedItem.items[0].paymentDate}</DetailValue>
                    </DetailRow>
                  )}
                </>
              ) : (
                <>
                  <DetailRow>
                    <DetailLabel>지출일:</DetailLabel>
                    <DetailValue><strong>{selectedItem.date}</strong></DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>제목:</DetailLabel>
                    <DetailValue><strong>{selectedItem.title || '-'}</strong></DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>현장:</DetailLabel>
                    <DetailValue>{selectedItem.site?.name || '-'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>작성자(반장):</DetailLabel>
                    <DetailValue>{selectedItem.creator?.name || selectedItem.creator?.phone || '-'}</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>금액:</DetailLabel>
                    <DetailValue $highlight>{selectedItem.amount.toLocaleString()}원</DetailValue>
                  </DetailRow>
                  <DetailRow>
                    <DetailLabel>내용:</DetailLabel>
                    <DetailValue>{selectedItem.content || '-'}</DetailValue>
                  </DetailRow>
                  <Divider />
                  <DetailRow>
                    <DetailLabel>상태:</DetailLabel>
                    <DetailValue>
                      <StatusBadge $status={selectedItem.status}>
                        {selectedItem.status === 'approved' ? '✅ 승인' : 
                         selectedItem.status === 'rejected' ? '❌ 거절' : '⏳ 대기'}
                      </StatusBadge>
                    </DetailValue>
                  </DetailRow>
                </>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${theme.spacing.lg};

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.md};
  }
`;

const Header = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const PageTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};

  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: 24px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${theme.colors.text.secondary};

  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: 14px;
  }
`;

const FilterSection = styled.div`
  background: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);

  @media (max-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.md};
  }
`;

const FilterRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  flex-wrap: wrap;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
  }
`;

const FilterGroup = styled.div`
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;

  @media (max-width: ${theme.breakpoints.tablet}) {
    min-width: 100%;
  }
`;

const FilterLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const DateInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-family: inherit;
  color: ${theme.colors.text.primary};
  background-color: ${theme.colors.background.primary};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
  
  &:disabled {
    background-color: ${theme.colors.background.secondary};
    color: ${theme.colors.text.secondary};
    cursor: not-allowed;
  }
`;

const ResetButton = styled.button`
  margin-top: auto;
  padding: 12px 16px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: #5a6268;
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    width: 100%;
  }
`;

const SummarySection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.md};
  }
`;

// 카드 내부 요소들을 먼저 선언 (참조용)
const CardLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xs};
`;

const CardValue = styled.div<{ $color?: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$color || theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};

  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: 20px;
  }
`;

const CardSubtext = styled.div`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
`;

interface SummaryCardProps {
  $highlight?: boolean;
  $status?: 'paid' | 'unpaid';
}

const SummaryCard = styled.div<SummaryCardProps>`
  background: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border};
  border-left: 4px solid ${props => {
    if (props.$highlight) return '#667eea';
    if (props.$status === 'paid') return '#4caf50';
    if (props.$status === 'unpaid') return '#ff9800';
    return theme.colors.border;
  }};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const CardIcon = styled.div`
  font-size: 32px;
`;

const CardContent = styled.div`
  flex: 1;
`;

const TableSection = styled.div`
  background: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.large};
  overflow: hidden;
`;

const TableHeader = styled.div`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.background.secondary};
  border-bottom: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${theme.breakpoints.tablet}) {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing.sm};
    padding: ${theme.spacing.md};
  }
`;

const TableTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${theme.colors.text.primary};

  @media (max-width: ${theme.breakpoints.tablet}) {
    font-size: 18px;
  }
`;

const TableCount = styled.div`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  font-weight: 600;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: ${theme.colors.background.secondary};
  }
`;

const Th = styled.th`
  padding: ${theme.spacing.md};
  text-align: left;
  font-size: 13px;
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
`;

interface TypeBadgeProps {
  $type: 'worklog' | 'expense';
}

const TypeBadge = styled.span<TypeBadgeProps>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.$type === 'worklog' ? '#e3f2fd' : '#fff3e0'};
  color: ${props => props.$type === 'worklog' ? '#1976d2' : '#f57c00'};
  white-space: nowrap;
`;

const AmountText = styled.span`
  font-weight: 600;
  color: #2196f3;
`;

interface StatusBadgeProps {
  $status: string;
}

const StatusBadge = styled.span<StatusBadgeProps>`
  display: inline-block;
  padding: 4px 12px;
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.$status === '지급완료' ? '#e8f5e9' : '#fff3e0'};
  color: ${props => props.$status === '지급완료' ? '#2e7d32' : '#f57c00'};
  white-space: nowrap;
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl} * 2;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 64px;
  margin-bottom: ${theme.spacing.lg};
`;

const EmptyText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const EmptySubtext = styled.div`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  font-size: 16px;
  color: ${theme.colors.text.secondary};
`;

const ErrorMessage = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  color: #c33;
  text-align: center;
`;

const ViewButton = styled.button`
  padding: 6px 12px;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
  }
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
  z-index: 1001;
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

export default AggregationPage;

