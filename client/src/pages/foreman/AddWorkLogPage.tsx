import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/common/Header';
import { StyledInput, StyledTextarea } from '../../components/common/StyledInput';
import { theme } from '../../styles/theme';
import { createWorkLog, getWorkersList } from '../../api/foreman';
import { useSiteStore } from '../../store/siteStore';

interface Worker {
  id: number;
  name: string;
  position?: string;
  rrn?: string; // 주민번호
  dailyRate?: number;
}

interface WorkerEffort {
  workerId: number;
  workerName: string;
  workerRRN?: string; // 주민번호 추가
  effort: string;
  dailyRate: string; // 수정 가능하도록 string으로 관리
}

const AddWorkLogPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedSiteId } = useSiteStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [selectedWorkers, setSelectedWorkers] = useState<WorkerEffort[]>([]);
  const [workDate, setWorkDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [bulkEffort, setBulkEffort] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // 현장이 선택되었을 때만 근무자 목록 조회
    if (selectedSiteId) {
      fetchWorkers();
    }
  }, [selectedSiteId]);

  const fetchWorkers = async () => {
    try {
      const response = await getWorkersList();
      setWorkers(Array.isArray(response) ? response : (response.data || []));
    } catch (error: any) {
      console.error('근무자 목록 조회 실패:', error);
      setError('근무자 목록을 불러오는데 실패했습니다.');
    }
  };

  const handleWorkerToggle = (worker: Worker) => {
    const exists = selectedWorkers.find(w => w.workerId === worker.id);
    
    if (exists) {
      // 이미 선택된 경우 제거
      setSelectedWorkers(selectedWorkers.filter(w => w.workerId !== worker.id));
    } else {
      // 새로 선택된 경우 추가 (단가와 주민번호도 함께 저장)
      setSelectedWorkers([...selectedWorkers, {
        workerId: worker.id,
        workerName: worker.name,
        workerRRN: worker.rrn, // 주민번호 추가
        effort: '1',
        dailyRate: worker.dailyRate ? worker.dailyRate.toString() : '0'
      }]);
    }
    setError('');
  };

  const handleEffortChange = (workerId: number, effort: string) => {
    setSelectedWorkers(selectedWorkers.map(w => 
      w.workerId === workerId ? { ...w, effort } : w
    ));
  };

  const handleDailyRateChange = (workerId: number, dailyRate: string) => {
    // 콤마 제거
    const value = dailyRate.replace(/,/g, '');
    // 숫자만 허용
    if (value === '' || /^\d+$/.test(value)) {
      setSelectedWorkers(selectedWorkers.map(w => 
        w.workerId === workerId ? { ...w, dailyRate: value } : w
      ));
    }
  };

  // 개별 근무자 금액 계산
  const calculateAmount = useCallback((effort: string, dailyRate: string): number => {
    const effortNum = parseFloat(effort) || 0;
    const rateNum = parseFloat(dailyRate) || 0;
    return effortNum * rateNum;
  }, []);

  // 총 금액 계산 (useMemo로 최적화 - 불필요한 재계산 방지)
  const totalAmount = useMemo(() => {
    return selectedWorkers.reduce((total, worker) => {
      return total + calculateAmount(worker.effort, worker.dailyRate);
    }, 0);
  }, [selectedWorkers, calculateAmount]);

  const handleBulkEffortApply = () => {
    if (!bulkEffort || parseFloat(bulkEffort) <= 0) {
      alert('유효한 공수를 입력해주세요.');
      return;
    }
    
    setSelectedWorkers(selectedWorkers.map(w => ({ ...w, effort: bulkEffort })));
    alert(`모든 선택된 근무자에게 ${bulkEffort}공수가 적용되었습니다.`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...filesArray]);
      // input value 초기화 (같은 파일 재선택 가능하도록)
      e.target.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // 검증
    if (selectedWorkers.length === 0) {
      setError('최소 1명의 근무자를 선택해주세요.');
      return;
    }
    
    if (!description.trim()) {
      setError('작업내용을 입력해주세요.');
      return;
    }
    
    // 모든 선택된 근무자의 공수 확인
    const invalidEffort = selectedWorkers.find(w => !w.effort || parseFloat(w.effort) <= 0);
    if (invalidEffort) {
      setError(`${invalidEffort.workerName}의 공수를 입력해주세요.`);
      return;
    }
    
    if (!selectedSiteId) {
      setError('현장이 선택되지 않았습니다.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      let successCount = 0;
      let failCount = 0;
      
      // 각 근무자별로 작업일지 등록
      for (const worker of selectedWorkers) {
        try {
          // 파일 첨부 지원
          await createWorkLog({
            workerId: worker.workerId,
            description: description,
            effort: parseFloat(worker.effort),
            workDate: workDate,
            siteId: selectedSiteId,
            attachments: attachments.length > 0 ? attachments : undefined  // 파일 추가
          });
          
          successCount++;
        } catch (err) {
          console.error(`${worker.workerName} 작업일지 등록 실패:`, err);
          failCount++;
        }
      }
      
      if (successCount > 0) {
        setSuccess(`${successCount}명의 작업일지가 등록되었습니다!${failCount > 0 ? ` (${failCount}명 실패)` : ''}`);
        
        // 2초 후 작업일지 목록으로 이동
        setTimeout(() => {
          navigate('/foreman/worklogs');
        }, 2000);
      } else {
        setError('모든 작업일지 등록에 실패했습니다.');
      }
      
    } catch (error: any) {
      setError(error.message || '작업일지 등록에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/foreman/worklogs');
  };

  return (
    <Container>
      <Header showSiteSelector={true} />
      
      <Content>
        <HeaderSection>
          <BackButton onClick={handleCancel}>← 돌아가기</BackButton>
          <PageTitle>작업일지 등록</PageTitle>
        </HeaderSection>
        
        {!selectedSiteId ? (
          <WarningCard>
            <WarningIcon>⚠️</WarningIcon>
            <WarningText>헤더에서 현장을 먼저 선택해주세요.</WarningText>
          </WarningCard>
        ) : (
        <FormCard>
          <Form>
            <FormGroup>
              <Label htmlFor="workDate">
                작업일 <Required>*</Required>
              </Label>
              <StyledInput
                id="workDate"
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>
                근무자 선택 <Required>*</Required>
              </Label>
              {workers.length === 0 ? (
                <HelpText>
                  등록된 근무자가 없습니다.{' '}
                  <LinkButton onClick={() => navigate('/foreman/add-worker')}>
                    근무자 추가하기
                  </LinkButton>
                </HelpText>
              ) : (
                <WorkerCheckboxList>
                  {workers.map((worker) => (
                    <WorkerCheckboxItem key={worker.id}>
                      <CheckboxLabel>
                        <Checkbox
                          type="checkbox"
                          checked={selectedWorkers.some(w => w.workerId === worker.id)}
                          onChange={() => handleWorkerToggle(worker)}
                        />
                        <WorkerInfo>
                          <WorkerName>{worker.name}</WorkerName>
                          {worker.rrn && (
                            <WorkerRRN>
                              {worker.rrn.replace(/-/g, '').length === 13 
                                ? `(${worker.rrn.replace(/-/g, '').substring(0, 6)}-${worker.rrn.replace(/-/g, '').substring(6, 13)})`
                                : worker.rrn.includes('-') 
                                  ? `(${worker.rrn})`
                                  : `(${worker.rrn})`
                              }
                            </WorkerRRN>
                          )}
                        </WorkerInfo>
                      </CheckboxLabel>
                    </WorkerCheckboxItem>
                  ))}
                </WorkerCheckboxList>
              )}
              <HelpText>작업에 참여한 근무자를 모두 선택하세요</HelpText>
            </FormGroup>

            {selectedWorkers.length > 0 && (
              <>
                <FormGroup>
                  <Label>
                    일괄 공수 적용
                  </Label>
                  <BulkEffortRow>
                    <BulkEffortInput
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={bulkEffort}
                      onChange={(e) => setBulkEffort(e.target.value)}
                      placeholder="예: 1 또는 0.5"
                    />
                    <ApplyButton type="button" onClick={handleBulkEffortApply}>
                      모두 적용
                    </ApplyButton>
                  </BulkEffortRow>
                  <HelpText>선택된 모든 근무자에게 같은 공수를 적용합니다</HelpText>
                </FormGroup>

                <FormGroup>
                  <Label>
                    개별 공수 및 단가 설정 <Required>*</Required>
                  </Label>
                  <WorkerCardList>
                    {selectedWorkers.map((worker) => {
                      const amount = calculateAmount(worker.effort, worker.dailyRate);
                      return (
                        <WorkerCard key={worker.workerId}>
                          <WorkerCardHeader>
                            <WorkerCardName>
                              {worker.workerName}
                              {worker.workerRRN && (
                                <WorkerCardRRN>
                                  {worker.workerRRN.replace(/-/g, '').length === 13 
                                    ? ` (${worker.workerRRN.replace(/-/g, '').substring(0, 6)}-${worker.workerRRN.replace(/-/g, '').substring(6, 13)})`
                                    : ` (${worker.workerRRN})`
                                  }
                                </WorkerCardRRN>
                              )}
                            </WorkerCardName>
                          </WorkerCardHeader>
                          <WorkerCardBody>
                            <InputRow>
                              <InputGroup>
                                <InputLabel>공수</InputLabel>
                                <InputWrapper>
                                  <WorkerInput
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="10"
                                    value={worker.effort}
                                    onChange={(e) => handleEffortChange(worker.workerId, e.target.value)}
                                    placeholder="1"
                                  />
                                </InputWrapper>
                              </InputGroup>
                              <InputGroup>
                                <InputLabel>단가</InputLabel>
                                <InputWrapper>
                                  <WorkerInput
                                    type="text"
                                    value={worker.dailyRate ? Number(worker.dailyRate).toLocaleString() : ''}
                                    onChange={(e) => handleDailyRateChange(worker.workerId, e.target.value)}
                                    placeholder="0"
                                  />
                                  <InputUnitText>원</InputUnitText>
                                </InputWrapper>
                              </InputGroup>
                            </InputRow>
                            <AmountRow>
                              <AmountLabel>💰 합계</AmountLabel>
                              <AmountDisplay>{amount.toLocaleString()}원</AmountDisplay>
                            </AmountRow>
                          </WorkerCardBody>
                        </WorkerCard>
                      );
                    })}
                  </WorkerCardList>
                  <HelpText>공수는 소수점 첫째 자리까지, 단가는 숫자만 입력 가능합니다</HelpText>
                </FormGroup>

                {selectedWorkers.length > 0 && (
                  <TotalAmountSection>
                    <TotalAmountLabel>총 금액</TotalAmountLabel>
                    <TotalAmountValue>{totalAmount.toLocaleString()}원</TotalAmountValue>
                  </TotalAmountSection>
                )}
              </>
            )}

            <FormGroup>
              <Label htmlFor="description">
                작업내용 <Required>*</Required>
              </Label>
              <StyledTextarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="작업 내용을 자유롭게 입력하세요&#10;예) 철근 조립 작업&#10;콘크리트 타설 작업 등"
                rows={6}
                required
              />
            </FormGroup>

            <FormGroup>
              <Label>사진 첨부 (선택)</Label>
              <FileUploadButton type="button" onClick={() => fileInputRef.current?.click()}>
                📷 사진 선택하기
              </FileUploadButton>
              <HiddenFileInput
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
              {attachments.length > 0 && (
                <AttachmentList>
                  {attachments.map((file, index) => (
                    <AttachmentItem key={index}>
                      <AttachmentName>📎 {file.name}</AttachmentName>
                      <RemoveButton onClick={() => handleRemoveFile(index)}>
                        ✕
                      </RemoveButton>
                    </AttachmentItem>
                  ))}
                </AttachmentList>
              )}
              <HelpText>작업 현장 사진을 여러 장 첨부할 수 있습니다</HelpText>
            </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}

            <ButtonGroup>
              <CancelButton type="button" onClick={handleCancel} disabled={loading}>
                취소
              </CancelButton>
              <SubmitButton type="button" onClick={handleSubmit} disabled={loading}>
                {loading ? '등록 중...' : '작업일지 등록'}
              </SubmitButton>
            </ButtonGroup>
          </Form>
        </FormCard>
        )}
      </Content>
    </Container>
  );
};

export default AddWorkLogPage;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background-color: ${theme.colors.background.primary};
`;

const Content = styled.div`
  padding: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    max-width: 800px;
    margin: 0 auto;
    padding: ${theme.spacing.xl};
  }
`;

const HeaderSection = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: 0.875rem;
  cursor: pointer;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: ${theme.colors.primaryDark};
  }
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.pageTitle.fontSize};
  font-weight: ${theme.typography.pageTitle.fontWeight};
  color: ${theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const WarningCard = styled.div`
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.xl};
  text-align: center;
`;

const WarningIcon = styled.div`
  font-size: 48px;
  margin-bottom: ${theme.spacing.md};
`;

const WarningText = styled.p`
  font-size: 18px;
  font-weight: 600;
  color: #856404;
  margin: 0;
`;

const FormCard = styled.div`
  background: white;
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.xl};
  }
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

const Required = styled.span`
  color: ${theme.colors.error};
`;

const WorkerCheckboxList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.medium};
  max-height: 250px;
  overflow-y: auto;
`;

const WorkerCheckboxItem = styled.div`
  display: flex;
  align-items: center;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  cursor: pointer;
  font-size: 14px;
  color: ${theme.colors.text.primary};
  padding: ${theme.spacing.xs};
  width: 100%;
  border-radius: ${theme.borderRadius.small};
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  span {
    user-select: none;
  }
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${theme.colors.accent};
`;

const WorkerInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const WorkerName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`;

const WorkerRRN = styled.span`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
  font-family: 'Courier New', monospace;
`;

const BulkEffortRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
`;

const BulkEffortInput = styled(StyledInput)`
  flex: 1;
  max-width: 200px;
`;

const ApplyButton = styled.button`
  padding: 12px 24px;
  background-color: ${theme.colors.accent};
  color: ${theme.colors.text.primary};
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const WorkerCardList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const WorkerCard = styled.div`
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

const WorkerCardHeader = styled.div`
  background: linear-gradient(135deg, ${theme.colors.accent}30 0%, ${theme.colors.accent}10 100%);
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
`;

const WorkerCardName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const WorkerCardRRN = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: ${theme.colors.text.secondary};
  margin-left: 8px;
  font-family: 'Courier New', monospace;
`;

const WorkerCardBody = styled.div`
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const InputRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${theme.spacing.sm};
  }
`;

const InputGroup = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const InputLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;

  /* 단가 입력 필드에 오른쪽 패딩 추가 (단위 텍스트 공간) */
  input:not([type="number"]) {
    padding-right: 38px !important;
  }
`;

const WorkerInput = styled(StyledInput)`
  width: 100%;
  font-size: 15px;
  font-weight: 600;
  padding: 12px;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px;
  }
`;

const InputUnitText = styled.span`
  position: absolute;
  right: 12px;
  font-size: 13px;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
  pointer-events: none;
  background-color: ${theme.colors.background.primary};
  padding-left: 4px;

  @media (max-width: 768px) {
    right: 10px;
    font-size: 12px;
  }
`;

const AmountRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.accent}20 0%, ${theme.colors.accent}05 100%);
  border-radius: ${theme.borderRadius.small};
  margin-top: ${theme.spacing.xs};
`;

const AmountLabel = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const AmountDisplay = styled.span`
  font-size: 18px;
  font-weight: 800;
  color: ${theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const TotalAmountSection = styled.div`
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

const TotalAmountLabel = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
`;

const TotalAmountValue = styled.span`
  font-size: 28px;
  font-weight: 800;
  color: ${theme.colors.text.primary};

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const HelpText = styled.p`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
  margin-top: 4px;
`;

const FileUploadButton = styled.button`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.secondary};
  border: 2px dashed ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
  
  &:hover {
    border-color: ${theme.colors.accent};
    background-color: ${theme.colors.accent}20;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const AttachmentList = styled.div`
  margin-top: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const AttachmentItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.small};
  border: 1px solid ${theme.colors.border};
`;

const AttachmentName = styled.span`
  font-size: 13px;
  color: ${theme.colors.text.primary};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.error};
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${theme.colors.error}20;
  }
`;

const LinkButton = styled.button`
  background: none;
  border: none;
  color: ${theme.colors.primary};
  font-size: 12px;
  text-decoration: underline;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: ${theme.colors.primaryDark};
  }
`;

const ErrorMessage = styled.div`
  padding: 12px 16px;
  background-color: #ffeaea;
  border-radius: ${theme.borderRadius.medium};
  color: #e74c3c;
  font-size: 14px;
  text-align: center;
`;

const SuccessMessage = styled.div`
  padding: 12px 16px;
  background-color: #eafff0;
  border-radius: ${theme.borderRadius.medium};
  color: #27ae60;
  font-size: 14px;
  text-align: center;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px 24px;
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
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background: ${theme.colors.button.primary};
  color: ${theme.colors.text.primary};
  border: 2px solid ${theme.colors.button.primary};
  border-radius: ${theme.borderRadius.medium};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

