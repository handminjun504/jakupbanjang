import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import Tabs from '../../components/common/Tabs';
import { StyledInput } from '../../components/common/StyledInput';
import StyledButton from '../../components/common/StyledButton';
import { theme } from '../../styles/theme';
import { getWorkLogs, deleteWorkLog, updateWorkLog } from '../../api/foreman';
import { useSiteStore } from '../../store/siteStore';
import { StyledTextarea } from '../../components/common/StyledInput';

interface Attachment {
  id: number;
  filename: string;
  file_path: string; // snake_case (백엔드 필드명)
  file_size: number; // snake_case (백엔드 필드명)
  mime_type: string; // snake_case (백엔드 필드명)
}

interface WorkLog {
  id: number;
  workDate: string;
  description: string;
  effort: number;
  dailyRate?: number; // 작업일지 생성 당시의 단가 (스냅샷)
  paymentStatus?: '미지급' | '지급완료'; // 지급 상태
  paymentDate?: string; // 지급일
  attachments?: Attachment[]; // 첨부파일 추가
  worker?: {
    id: number;
    name: string;
    phoneNumber?: string;
    dailyRate?: number; // 근무자의 현재 단가
    status?: 'active' | 'resigned'; // 근무자 상태
    resignedDate?: string; // 퇴사일
  };
}

/**
 * 근무자 이름 표시 헬퍼 (퇴사자 여부 표시)
 */
const getWorkerDisplayName = (worker?: WorkLog['worker']): string => {
  if (!worker || !worker.name) {
    return '이름 없음';
  }
  return worker.status === 'resigned' ? `${worker.name} (퇴사)` : worker.name;
};

interface GroupedWorkLog {
  date: string;
  totalEffort: number;
  totalAmount: number;
  description: string;
  fullDescription: string;
  workLogs: WorkLog[];
  isPaid?: boolean; // 지급완료 여부
  attachments?: Attachment[]; // 첨부파일 추가
}

interface EditWorkLogData {
  id: number;
  effort: number;
}

const WorkLogListPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedSiteId } = useSiteStore();
  const [activeTab, setActiveTab] = useState('work-logs');
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [workLogs, setWorkLogs] = useState<WorkLog[]>([]);
  const [groupedWorkLogs, setGroupedWorkLogs] = useState<GroupedWorkLog[]>([]);
  const [selectedWorkLog, setSelectedWorkLog] = useState<GroupedWorkLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 수정 모드 상태
  const [isEditMode, setIsEditMode] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editEfforts, setEditEfforts] = useState<EditWorkLogData[]>([]);

  const tabs = [
    { id: 'work-logs', label: '작업일지' },
    { id: 'expense', label: '지출비용' },
    { id: 'workers', label: '근무자 리스트' },
  ];

  useEffect(() => {
    // 현장이 선택되었을 때만 작업일지 조회
    if (selectedSiteId) {
      fetchWorkLogs();
    }
  }, [selectedSiteId, workDate]);

  const fetchWorkLogs = async () => {
    if (!selectedSiteId) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await getWorkLogs(selectedSiteId, workDate);
      const logs = Array.isArray(response) ? response : (response.data || []);
      setWorkLogs(logs);
      
      // 날짜별로 그룹화
      groupWorkLogsByDate(logs);
    } catch (error: any) {
      console.error('작업일지 조회 실패:', error);
      setError(error.message || '작업일지를 불러오는데 실패했습니다.');
      setWorkLogs([]);
      setGroupedWorkLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const groupWorkLogsByDate = (logs: WorkLog[]) => {
    const grouped: { [key: string]: GroupedWorkLog } = {};
    
    logs.forEach((log) => {
      const date = log.workDate;
      
      if (!grouped[date]) {
        grouped[date] = {
          date,
          totalEffort: 0,
          totalAmount: 0,
          description: '',
          fullDescription: log.description,
          workLogs: [],
          isPaid: false,
          attachments: []
        };
      }
      
      grouped[date].workLogs.push(log);
      grouped[date].totalEffort += log.effort;
      
      // 금액 계산 (공수 × 단가)
      // 작업일지에 저장된 단가 우선, 없으면 현재 근무자 단가 사용 (하위 호환성)
      const dailyRate = log.dailyRate ?? log.worker?.dailyRate ?? 0;
      grouped[date].totalAmount += log.effort * dailyRate;
      
      // 작업내용 (같은 내용이면 중복 제거)
      if (!grouped[date].description) {
        grouped[date].description = log.description;
      }
      
      // 첨부파일 수집
      if (log.attachments && log.attachments.length > 0) {
        grouped[date].attachments = [...(grouped[date].attachments || []), ...log.attachments];
      }
      
      // 지급완료 여부 확인 (하나라도 지급완료면 전체가 지급완료로 표시)
      if (log.paymentStatus === '지급완료' || log.paymentDate) {
        grouped[date].isPaid = true;
      }
    });
    
    setGroupedWorkLogs(Object.values(grouped).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const handleViewDetail = (workLog: GroupedWorkLog) => {
    setSelectedWorkLog(workLog);
  };

  const handleCloseDetail = () => {
    setSelectedWorkLog(null);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleEditWorkLog = (grouped: GroupedWorkLog) => {
    // 수정 모드 활성화 및 데이터 설정
    setSelectedWorkLog(grouped);
    setIsEditMode(true);
    setEditDate(grouped.date);
    setEditDescription(grouped.fullDescription);
    setEditEfforts(grouped.workLogs.map(log => ({
      id: log.id,
      effort: log.effort
    })));
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditDate('');
    setEditDescription('');
    setEditEfforts([]);
    setSelectedWorkLog(null); // 모달 완전히 닫기
  };

  const handleEffortChange = (workLogId: number, effort: string) => {
    setEditEfforts(editEfforts.map(e => 
      e.id === workLogId ? { ...e, effort: parseFloat(effort) || 0 } : e
    ));
  };

  const handleSaveEdit = async () => {
    if (!editDescription.trim()) {
      alert('작업내용을 입력해주세요.');
      return;
    }

    if (!window.confirm('작업일지를 수정하시겠습니까?')) {
      return;
    }

    try {
      setLoading(true);
      
      let successCount = 0;
      let failCount = 0;
      
      // 각 작업일지 개별 업데이트
      for (const editData of editEfforts) {
        try {
          await updateWorkLog(editData.id, {
            workDate: editDate,
            description: editDescription,
            effort: editData.effort
          });
          successCount++;
        } catch (err) {
          console.error(`작업일지 ${editData.id} 수정 실패:`, err);
          failCount++;
        }
      }
      
      if (successCount > 0) {
        alert(`${successCount}건의 작업일지가 수정되었습니다.${failCount > 0 ? `\n(${failCount}건 실패)` : ''}`);
        // 수정 모드 종료 및 목록 새로고침
        handleCancelEdit();
        setSelectedWorkLog(null);
        fetchWorkLogs();
      } else {
        setError('작업일지 수정에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Update work logs error:', error);
      setError(error.message || '작업일지 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWorkLog = async (grouped: GroupedWorkLog) => {
    if (!window.confirm(`${grouped.date} 작업일지 ${grouped.workLogs.length}건을 모두 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      setLoading(true);
      
      // 해당 날짜의 모든 작업일지 삭제
      let successCount = 0;
      let failCount = 0;
      
      for (const log of grouped.workLogs) {
        try {
          await deleteWorkLog(log.id);
          successCount++;
        } catch (err) {
          console.error(`작업일지 ${log.id} 삭제 실패:`, err);
          failCount++;
        }
      }
      
      if (successCount > 0) {
        alert(`${successCount}건의 작업일지가 삭제되었습니다.${failCount > 0 ? `\n(${failCount}건 실패)` : ''}`);
        // 목록 새로고침
        fetchWorkLogs();
      } else {
        setError('작업일지 삭제에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Delete work logs error:', error);
      setError(error.message || '작업일지 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'expense') {
      navigate('/foreman/expense');
    } else if (tabId === 'workers') {
      navigate('/foreman/workers');
    }
  };

  const handleAddWorkLog = () => {
    navigate('/foreman/add-worklog');
  };

  return (
    <Container>
      <Header showSiteSelector={true} />
      
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      
      <Content>
        <PageHeader>
          <PageTitle>작업일지</PageTitle>
        </PageHeader>

        {!selectedSiteId ? (
          <WarningMessage>
            ⚠️ 헤더에서 현장을 선택해주세요.
          </WarningMessage>
        ) : (
          <>
        <ActionSection>
          <FilterSection>
                <Label>작업일 선택</Label>
                <DateControl>
                  <QuickDateButtons>
                    <QuickDateButton 
                      $active={workDate === new Date().toISOString().split('T')[0]}
                      onClick={() => setWorkDate(new Date().toISOString().split('T')[0])}
                    >
                      오늘
                    </QuickDateButton>
                  </QuickDateButtons>
            <DateInput
              type="date"
              value={workDate}
              onChange={(e) => setWorkDate(e.target.value)}
            />
                </DateControl>
          </FilterSection>
          
          <AddButton onClick={handleAddWorkLog}>
            + 작업등록
          </AddButton>
        </ActionSection>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        
            <DateInfoBar>
              📅 {new Date(workDate).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })} 작업일지
            </DateInfoBar>

            {loading ? (
              <LoadingMessage>로딩 중...</LoadingMessage>
            ) : groupedWorkLogs.length === 0 ? (
              <EmptyState>
                {new Date(workDate).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}에 
                  등록된 작업일지가 없습니다
                  <br />
                  <AddWorkLogLink onClick={handleAddWorkLog}>
                    작업일지 등록하기 →
                  </AddWorkLogLink>
              </EmptyState>
            ) : (
              <WorkLogList>
                {groupedWorkLogs.map((grouped, index) => (
                  <WorkLogCard key={index}>
                    <CardHeader>
                      <CardDate>
                        {new Date(grouped.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                      month: '2-digit',
                          day: '2-digit',
                          weekday: 'short'
                        })}
                      </CardDate>
                      <WorkerCount>{grouped.workLogs.length}명 참여</WorkerCount>
                    </CardHeader>
                    
                    <CardBody>
                      <InfoRow>
                        <InfoLabel>총 공수</InfoLabel>
                        <InfoValue>{grouped.totalEffort}공수</InfoValue>
                      </InfoRow>
                      <InfoRow>
                        <InfoLabel>총 금액</InfoLabel>
                        <InfoValue $highlight>{grouped.totalAmount.toLocaleString()}원</InfoValue>
                      </InfoRow>
                      <InfoRow>
                        <InfoLabel>작업내용</InfoLabel>
                        <InfoValue>{truncateText(grouped.description, 50)}</InfoValue>
                      </InfoRow>
                    </CardBody>
                    
                    <CardFooter>
                      <DetailButton onClick={() => handleViewDetail(grouped)}>
                        상세보기
                      </DetailButton>
                      <ActionButtons>
                        {grouped.isPaid ? (
                          <PaidInfo>✅ 지급완료 (수정/삭제 불가)</PaidInfo>
                        ) : (
                          <>
                            <EditButton onClick={() => handleEditWorkLog(grouped)}>수정</EditButton>
                            <DeleteButton onClick={() => handleDeleteWorkLog(grouped)}>삭제</DeleteButton>
                          </>
                        )}
                      </ActionButtons>
                    </CardFooter>
                  </WorkLogCard>
                ))}
              </WorkLogList>
            )}
            
            {/* 상세보기/수정 모달 */}
            {selectedWorkLog && (
              <Modal onClick={isEditMode ? undefined : handleCloseDetail}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                  <ModalHeader>
                    <ModalTitle>{isEditMode ? '작업일지 수정' : '작업일지 상세'}</ModalTitle>
                    <CloseButton onClick={isEditMode ? handleCancelEdit : handleCloseDetail}>✕</CloseButton>
                  </ModalHeader>
                  
                  <ModalBody>
                    {isEditMode ? (
                      // 수정 모드
                      <>
                        <DetailSection>
                          <DetailLabel>작업일 *</DetailLabel>
                          <EditInput
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                          />
                        </DetailSection>
                        
                        <DetailSection>
                          <DetailLabel>참여 인원 및 공수 *</DetailLabel>
                          <EditWorkerCardList>
                            {selectedWorkLog.workLogs.map((log) => {
                              const editData = editEfforts.find(e => e.id === log.id);
                              const dailyRate = log.dailyRate ?? log.worker?.dailyRate ?? 0;
                              const amount = (editData?.effort || 0) * dailyRate;
                              return (
                                <EditWorkerCard key={log.id}>
                                  <EditWorkerCardHeader>
                                    <EditWorkerCardName>{getWorkerDisplayName(log.worker)}</EditWorkerCardName>
                                  </EditWorkerCardHeader>
                                  <EditWorkerCardBody>
                                    <EditInputRow>
                                      <EditInputGroup>
                                        <EditInputLabel>공수</EditInputLabel>
                                        <EditInputWrapper>
                                          <EditWorkerInput
                                            type="number"
                                            step="0.1"
                                            min="0"
                                            max="10"
                                            value={editData?.effort || 0}
                                            onChange={(e) => handleEffortChange(log.id, e.target.value)}
                                            placeholder="1"
                                          />
                                        </EditInputWrapper>
                                      </EditInputGroup>
                                      <EditInputGroup>
                                        <EditInputLabel>단가</EditInputLabel>
                                        <EditInputWrapper>
                                          <EditWorkerInput
                                            type="text"
                                            value={dailyRate.toLocaleString()}
                                            readOnly
                                            disabled
                                          />
                                          <EditInputUnitText>원</EditInputUnitText>
                                        </EditInputWrapper>
                                      </EditInputGroup>
                                    </EditInputRow>
                                    <EditAmountRow>
                                      <EditAmountLabel>💰 합계</EditAmountLabel>
                                      <EditAmountDisplay>{amount.toLocaleString()}원</EditAmountDisplay>
                                    </EditAmountRow>
                                  </EditWorkerCardBody>
                                </EditWorkerCard>
                              );
                            })}
                          </EditWorkerCardList>
                          
                          <EditTotalAmountSection>
                            <EditTotalAmountLabel>총 금액</EditTotalAmountLabel>
                            <EditTotalAmountValue>
                              {editEfforts.reduce((total, editData) => {
                                const log = selectedWorkLog.workLogs.find(l => l.id === editData.id);
                                const dailyRate = log?.dailyRate ?? log?.worker?.dailyRate ?? 0;
                                return total + (editData.effort * dailyRate);
                              }, 0).toLocaleString()}원
                            </EditTotalAmountValue>
                          </EditTotalAmountSection>
                        </DetailSection>
                        
                        <DetailSection>
                          <DetailLabel>작업내용 *</DetailLabel>
                          <EditTextarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="작업 내용을 입력하세요"
                            rows={6}
                          />
                        </DetailSection>
                        
                        <EditButtonGroup>
                          <CancelEditButton onClick={handleCancelEdit}>
                            취소
                          </CancelEditButton>
                          <SaveEditButton onClick={handleSaveEdit} disabled={loading}>
                            {loading ? '저장 중...' : '저장'}
                          </SaveEditButton>
                        </EditButtonGroup>
                      </>
                    ) : (
                      // 보기 모드
                      <>
                        <DetailSection>
                          <DetailLabel>작업일</DetailLabel>
                          <DetailValue>
                            {new Date(selectedWorkLog.date).toLocaleDateString('ko-KR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              weekday: 'long'
                            })}
                          </DetailValue>
                        </DetailSection>
                        
                        <DetailSection>
                          <DetailLabel>참여 인원</DetailLabel>
                          <WorkerList>
                            {selectedWorkLog.workLogs.map((log) => {
                              const dailyRate = log.dailyRate ?? log.worker?.dailyRate ?? 0;
                              return (
                                <WorkerItem key={log.id}>
                                  <WorkerName>{log.worker?.name || '이름 없음'}</WorkerName>
                                  <WorkerInfo>
                                    <WorkerDetail>
                                      <WorkerDetailLabel>공수</WorkerDetailLabel>
                                      <WorkerDetailValue>{log.effort}공수</WorkerDetailValue>
                                    </WorkerDetail>
                                    <WorkerDetail>
                                      <WorkerDetailLabel>단가</WorkerDetailLabel>
                                      <WorkerDetailValue>
                                        {dailyRate.toLocaleString()}원
                                      </WorkerDetailValue>
                                    </WorkerDetail>
                                    <WorkerDetail>
                                      <WorkerDetailLabel>금액</WorkerDetailLabel>
                                      <WorkerDetailValue $highlight>
                                        {(log.effort * dailyRate).toLocaleString()}원
                                      </WorkerDetailValue>
                                    </WorkerDetail>
                                  </WorkerInfo>
                                </WorkerItem>
                              );
                            })}
                          </WorkerList>
                        </DetailSection>
                        
                        <DetailSection>
                          <DetailLabel>작업내용</DetailLabel>
                          <FullDescription>{selectedWorkLog.fullDescription}</FullDescription>
                        </DetailSection>
                        
                        {selectedWorkLog.attachments && selectedWorkLog.attachments.length > 0 && (
                          <DetailSection>
                            <DetailLabel>📎 첨부파일 ({selectedWorkLog.attachments.length}개)</DetailLabel>
                            <AttachmentsGrid>
                              {selectedWorkLog.attachments.map((attachment) => {
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
                                    <AttachmentName title={attachment.filename}>
                                      {attachment.filename}
                                    </AttachmentName>
                                  </AttachmentCard>
                                );
                              })}
                            </AttachmentsGrid>
                          </DetailSection>
                        )}
                        
                        <TotalSummary>
                          <SummaryRow>
                            <SummaryLabel>총 공수</SummaryLabel>
                            <SummaryValue>{selectedWorkLog.totalEffort}공수</SummaryValue>
                          </SummaryRow>
                          <SummaryRow>
                            <SummaryLabel>총 금액</SummaryLabel>
                            <SummaryValue $highlight>
                              {selectedWorkLog.totalAmount.toLocaleString()}원
                            </SummaryValue>
                          </SummaryRow>
                        </TotalSummary>
                      </>
                    )}
                  </ModalBody>
                </ModalContent>
              </Modal>
            )}
          </>
        )}
      </Content>
    </Container>
  );
};

export default WorkLogListPage;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.background.primary};
`;

const Content = styled.div`
  padding: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    max-width: ${theme.maxWidth.content};
    margin: 0 auto;
    padding: ${theme.spacing.xl};
  }
`;

const PageHeader = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.pageTitle.fontSize};
  font-weight: ${theme.typography.pageTitle.fontWeight};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const ActionSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    flex-direction: row;
  justify-content: space-between;
  align-items: flex-end;
  }
`;

const FilterSection = styled.div`
  flex: 1;
  width: 100%;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    width: auto;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 14px;
  }
`;

const DateControl = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  width: 100%;
`;

const QuickDateButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const QuickDateButton = styled.button<{ $active?: boolean }>`
  flex: 1;
  padding: 10px 16px;
  background-color: ${props => props.$active ? theme.colors.accent : 'white'};
  color: ${props => props.$active ? 'white' : theme.colors.text.primary};
  border: 1px solid ${props => props.$active ? theme.colors.accent : theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.$active ? theme.colors.accent : theme.colors.background.primary};
  }
`;

const DateInput = styled(StyledInput)`
  width: 100%;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
  max-width: 300px;
  }
`;

const AddButton = styled(StyledButton)`
  white-space: nowrap;
  width: 100%;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    width: auto;
  }
`;

const DateInfoBar = styled.div`
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.accent}30 0%, ${theme.colors.accent}10 100%);
  border-left: 4px solid ${theme.colors.accent};
  border-radius: ${theme.borderRadius.small};
  font-size: 15px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
  text-align: center;
`;

const WarningMessage = styled.div`
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  background-color: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: ${theme.borderRadius.medium};
  color: #856404;
  text-align: center;
  font-weight: 600;
  font-size: 16px;
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

const LoadingMessage = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: 16px;
`;

const EmptyState = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  color: ${theme.colors.text.secondary};
  font-size: 16px;
`;

const AddWorkLogLink = styled.button`
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

const WorkLogList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const WorkLogCard = styled.div`
  background-color: ${theme.colors.background.secondary};
    border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.accent};
  border-bottom: 1px solid ${theme.colors.border};
`;

const CardDate = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
`;

const WorkerCount = styled.div`
  font-size: 13px;
  color: ${theme.colors.text.secondary};
  background-color: rgba(255, 255, 255, 0.5);
  padding: 4px 12px;
  border-radius: ${theme.borderRadius.small};
`;

const CardBody = styled.div`
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const InfoLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
`;

const InfoValue = styled.div<{ $highlight?: boolean }>`
  font-size: 15px;
  font-weight: ${props => props.$highlight ? '700' : '500'};
  color: ${props => props.$highlight ? theme.colors.accent : theme.colors.text.primary};
  text-align: right;
  flex: 1;
  margin-left: ${theme.spacing.md};
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.primary};
  border-top: 1px solid ${theme.colors.border};
`;

const DetailButton = styled.button`
  padding: 8px 20px;
  background-color: ${theme.colors.text.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.small};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const EditButton = styled.button`
  padding: 8px 16px;
  background-color: transparent;
  color: ${theme.colors.text.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${theme.colors.background.primary};
  }
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  background-color: transparent;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: ${theme.borderRadius.small};
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #ffeaea;
  }
`;

const PaidInfo = styled.div`
  padding: 8px 16px;
  background-color: #e8f5e9;
  color: #2e7d32;
  border: 1px solid #4caf50;
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
`;

// 모달 스타일
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: ${theme.spacing.md};
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: ${theme.borderRadius.large};
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
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
  font-size: 24px;
    color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${theme.colors.background.primary};
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
`;

const DetailSection = styled.div`
  margin-bottom: ${theme.spacing.lg};

  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
`;

const DetailValue = styled.div`
  font-size: 16px;
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing.sm};
  background-color: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.small};
`;

const WorkerList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const WorkerItem = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.small};
  border: 1px solid ${theme.colors.border};
`;

const WorkerName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const WorkerInfo = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const WorkerDetail = styled.div`
  flex: 1;
  min-width: 80px;
`;

const WorkerDetailLabel = styled.div`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
  margin-bottom: 4px;
`;

const WorkerDetailValue = styled.div<{ $highlight?: boolean }>`
  font-size: 14px;
  font-weight: ${props => props.$highlight ? '700' : '600'};
  color: ${props => props.$highlight ? theme.colors.accent : theme.colors.text.primary};
`;

const FullDescription = styled.div`
  font-size: 15px;
  color: ${theme.colors.text.primary};
  line-height: 1.6;
  white-space: pre-wrap;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.small};
`;

const AttachmentInfo = styled.div`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.small};
  text-align: center;
`;

/* 첨부파일 스타일 */
const AttachmentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
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
  height: 120px;
  object-fit: cover;
  cursor: pointer;
  background-color: #f5f5f5;
  
  &:hover {
    opacity: 0.9;
  }
`;

const AttachmentFile = styled.div`
  width: 100%;
  height: 120px;
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
  font-size: 36px;
  margin-bottom: ${theme.spacing.xs};
`;

const FileName = styled.div`
  font-size: 11px;
  color: ${theme.colors.text.secondary};
  text-align: center;
  padding: 0 ${theme.spacing.xs};
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const AttachmentName = styled.div`
  font-size: 11px;
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing.xs};
  background-color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const TotalSummary = styled.div`
  margin-top: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.accent}40 0%, ${theme.colors.accent}20 100%);
  border-radius: ${theme.borderRadius.medium};
  border: 2px solid ${theme.colors.accent};
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.sm} 0;

  &:not(:last-child) {
  border-bottom: 1px solid ${theme.colors.border};
    margin-bottom: ${theme.spacing.sm};
    padding-bottom: ${theme.spacing.sm};
  }
`;

const SummaryLabel = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`;

const SummaryValue = styled.div<{ $highlight?: boolean }>`
  font-size: ${props => props.$highlight ? '20px' : '16px'};
  font-weight: 700;
  color: ${props => props.$highlight ? theme.colors.accent : theme.colors.text.primary};
`;

// 수정 모드 스타일 (작업 등록 페이지와 동일)
const EditInput = styled(StyledInput)`
  width: 100%;
  font-size: 15px;
`;

const EditTextarea = styled(StyledTextarea)`
  width: 100%;
  font-size: 15px;
  line-height: 1.6;
  resize: vertical;
`;

const EditWorkerCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const EditWorkerCard = styled.div`
  background-color: ${theme.colors.background.primary};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.accent};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const EditWorkerCardHeader = styled.div`
  background: linear-gradient(135deg, ${theme.colors.accent}30 0%, ${theme.colors.accent}10 100%);
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
`;

const EditWorkerCardName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const EditWorkerCardBody = styled.div`
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const EditInputRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
  }
`;

const EditInputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const EditInputLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const EditInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  /* 단가 입력 필드에 오른쪽 패딩 추가 (단위 텍스트 공간) */
  input:not([type="number"]) {
    padding-right: 38px !important;
  }

  /* disabled 상태 스타일 */
  input:disabled {
    background-color: ${theme.colors.background.secondary};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const EditWorkerInput = styled(StyledInput)`
  width: 100%;
  font-size: 15px;
  font-weight: 600;
  padding: 12px;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px;
  }
`;

const EditInputUnitText = styled.span`
  position: absolute;
  right: 12px;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
  pointer-events: none;
  background-color: ${theme.colors.background.secondary};
  padding-left: 4px;

  @media (max-width: 768px) {
    right: 10px;
    font-size: 12px;
  }
`;

const EditAmountRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.accent}20 0%, ${theme.colors.accent}05 100%);
  border-radius: ${theme.borderRadius.small};
  margin-top: ${theme.spacing.xs};
`;

const EditAmountLabel = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const EditAmountDisplay = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: ${theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const EditTotalAmountSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, ${theme.colors.accent}40 0%, ${theme.colors.accent}20 100%);
  border-radius: ${theme.borderRadius.medium};
  margin-top: ${theme.spacing.md};
  border: 2px solid ${theme.colors.accent};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
    text-align: center;
  }
`;

const EditTotalAmountLabel = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
`;

const EditTotalAmountValue = styled.span`
  font-size: 28px;
  font-weight: 800;
  color: ${theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const EditButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
  padding-top: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.border};
`;

const CancelEditButton = styled.button`
  flex: 1;
  padding: 14px 24px;
  background: white;
  color: ${theme.colors.text.secondary};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    border-color: ${theme.colors.text.secondary};
    color: ${theme.colors.text.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 14px;
  }
`;

const SaveEditButton = styled.button<{ disabled?: boolean }>`
  flex: 1;
  padding: 14px 24px;
  background-color: ${theme.colors.button.primary};
  color: ${theme.colors.text.primary};
  border: 2px solid ${theme.colors.button.primary};
  border-radius: ${theme.borderRadius.medium};
  font-size: 16px;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  opacity: ${props => props.disabled ? 0.5 : 1};
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 14px;
  }
`;
