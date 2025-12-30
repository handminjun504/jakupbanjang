import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import Tabs from '../components/common/Tabs';
import StyledButton from '../components/common/StyledButton';
import { StyledTextarea, StyledInput } from '../components/common/StyledInput';
import { theme } from '../styles/theme';
import { useSiteStore } from '../store/siteStore';
import { createExpense, getExpenses } from '../api/foreman';

interface Expense {
  id: number;
  title: string;
  content: string;
  amount: number;
  expenseDate: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectReason?: string;
  createdAt: string;
  approvalDate?: string;
  site?: {
    id: number;
    name: string;
    address?: string;
  };
  creator?: {
    id: number;
    email: string;
    phone?: string;
    role: string;
  };
  approver?: {
    id: number;
    email: string;
    role: string;
  };
}

const ExpenseEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedSiteId, selectedSite } = useSiteStore();
  const [activeTab, setActiveTab] = useState('expense');
  const [expenseSubTab, setExpenseSubTab] = useState<'register' | 'list'>('register');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const tabs = [
    { id: 'work-logs', label: '작업일지' },
    { id: 'expense', label: '지출비용' },
    { id: 'workers', label: '근무자 리스트' },
  ];

  useEffect(() => {
    // 내역 탭일 때 지출결의 목록 불러오기
    if (expenseSubTab === 'list') {
      fetchExpenses();
    }
  }, [expenseSubTab, filterStatus, selectedSiteId]);

  const fetchExpenses = async () => {
    try {
      setExpensesLoading(true);
      const status = filterStatus === 'all' ? undefined : filterStatus;
      const data = await getExpenses(selectedSiteId || undefined, status);
      setExpenses(Array.isArray(data) ? data : (data.data || []));
    } catch (error: any) {
      console.error('지출결의 목록 조회 실패:', error);
      alert(error.message || '지출결의 목록을 불러오는데 실패했습니다.');
    } finally {
      setExpensesLoading(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'work-logs') {
      navigate('/foreman/worklogs');
    } else if (tabId === 'workers') {
      navigate('/foreman/workers');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, ''); // 콤마 제거
    if (value === '' || /^\d+$/.test(value)) {
      // 숫자만 허용
      const formattedValue = value ? Number(value).toLocaleString() : '';
      setAmount(formattedValue);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSiteId) {
      alert('현장을 선택해주세요.');
      return;
    }
    
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    
    if (!amount.trim()) {
      alert('금액을 입력해주세요.');
      return;
    }
    
    try {
      setLoading(true);
      const numericAmount = Number(amount.replace(/,/g, '')); // 콤마 제거 후 숫자로 변환
      
      await createExpense({
        title: title.trim(),
        content: content.trim(),
        amount: numericAmount,
        expenseDate,
        siteId: selectedSiteId
      });
      
      alert('지출결의가 등록되었습니다.\n관리자 승인 후 확정됩니다.');
      setTitle('');
      setContent('');
      setAmount('');
      setExpenseDate(new Date().toISOString().split('T')[0]);
      setSelectedFile(null);
      
      // 내역 탭으로 전환
      setExpenseSubTab('list');
    } catch (error: any) {
      console.error('저장 실패:', error);
      alert(error.message || '저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Header showSiteSelector={true} />
      
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
      
      <Content>
        <PageTitle>지출 비용</PageTitle>
        
        {!selectedSiteId && (
          <WarningMessage>
            ⚠️ 헤더에서 현장을 선택해주세요.
          </WarningMessage>
        )}
        
        {/* 서브탭 */}
        <SubTabContainer>
          <SubTab
            $active={expenseSubTab === 'register'}
            onClick={() => setExpenseSubTab('register')}
          >
            등록
          </SubTab>
          <SubTab
            $active={expenseSubTab === 'list'}
            onClick={() => setExpenseSubTab('list')}
          >
            내역
          </SubTab>
        </SubTabContainer>

        {expenseSubTab === 'register' ? (
          <Section>
            <SectionTitle>지출내역 등록</SectionTitle>
          
          <Form>
            <FormGroup>
              <Label>제목 *</Label>
              <StyledInput
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="지출 제목을 입력하세요 (예: 자재 구매)"
              />
            </FormGroup>

            <FormGroup>
              <Label>지출일자 *</Label>
              <StyledInput
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>내용 *</Label>
              <StyledTextarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="지출 내용을 자세히 입력하세요"
                rows={4}
              />
            </FormGroup>
            
            <FormGroup>
              <Label>금액 *</Label>
              <AmountInputWrapper>
                <StyledInput
                  type="text"
                  value={amount}
                  onChange={handleAmountChange}
                  placeholder="금액을 입력하세요 (예: 50,000)"
                />
                <AmountUnit>원</AmountUnit>
              </AmountInputWrapper>
            </FormGroup>
            
            <FormGroup>
              <Label>증빙 첨부 (선택)</Label>
              <FileInputWrapper>
                <FileInputDisplay>
                  {selectedFile ? selectedFile.name : '파일이 선택되지 않았습니다'}
                </FileInputDisplay>
                <FileSelectButton onClick={() => document.getElementById('expense-file-input')?.click()}>
                  파일선택
                </FileSelectButton>
                <HiddenFileInput
                  id="expense-file-input"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                />
              </FileInputWrapper>
            </FormGroup>
            
            <SubmitButton onClick={handleSubmit} disabled={loading}>
              {loading ? '등록 중...' : '지출결의 등록'}
            </SubmitButton>
          </Form>
        </Section>
        ) : (
          /* 내역 탭 */
          <Section>
            <ListHeader>
              <SectionTitle>지출결의 내역</SectionTitle>
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
            </ListHeader>

            {expensesLoading ? (
              <LoadingMessage>불러오는 중...</LoadingMessage>
            ) : expenses.length === 0 ? (
              <EmptyMessage>등록된 지출결의가 없습니다.</EmptyMessage>
            ) : (
              <ExpenseTable>
                <thead>
                  <tr>
                    <TableHeader>지출일자</TableHeader>
                    <TableHeader>현장</TableHeader>
                    <TableHeader>제목</TableHeader>
                    <TableHeader>금액</TableHeader>
                    <TableHeader>상태</TableHeader>
                    <TableHeader>작업</TableHeader>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense) => (
                    <tr key={expense.id}>
                      <TableCell>{expense.expenseDate}</TableCell>
                      <TableCell>{expense.site?.name || '-'}</TableCell>
                      <TableCell>{expense.title}</TableCell>
                      <TableCell $highlight>{expense.amount.toLocaleString()}원</TableCell>
                      <TableCell>
                        <StatusBadge $status={expense.status}>
                          {expense.status === 'pending' && '대기중'}
                          {expense.status === 'approved' && '승인'}
                          {expense.status === 'rejected' && '거절'}
                        </StatusBadge>
                      </TableCell>
                      <TableCell>
                        <DetailButton onClick={() => setSelectedExpense(expense)}>
                          상세보기
                        </DetailButton>
                      </TableCell>
                    </tr>
                  ))}
                </tbody>
              </ExpenseTable>
            )}
          </Section>
        )}
        
        {/* 상세보기 모달 */}
        {selectedExpense && (
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
                  <DetailLabel>작성자:</DetailLabel>
                  <DetailValue>
                    {selectedExpense.creator?.phone || selectedExpense.creator?.email || '-'}
                  </DetailValue>
                </DetailRow>
                <DetailRow>
                  <DetailLabel>상태:</DetailLabel>
                  <DetailValue>
                    <StatusBadge $status={selectedExpense.status}>
                      {selectedExpense.status === 'pending' && '대기중'}
                      {selectedExpense.status === 'approved' && '승인'}
                      {selectedExpense.status === 'rejected' && '거절'}
                    </StatusBadge>
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
        
        <FooterLinks>
          <FooterLink>회사소개</FooterLink>
          <Separator>|</Separator>
          <FooterLink>채용안내</FooterLink>
          <Separator>|</Separator>
          <FooterLink>업체 제휴신청</FooterLink>
          <Separator>|</Separator>
          <FooterLink>개인정보처리방침</FooterLink>
          <Separator>|</Separator>
          <FooterLink>이용약관</FooterLink>
        </FooterLinks>
        
        <FooterInfo>
          <CompanyName>(주)경리업무를잘하는청년들</CompanyName>
          <InfoText>사업자등록번호: 435-87-01827</InfoText>
          <InfoText>주소: 경기도 수원시 권광로175번길 83 리치빌 1차 3층</InfoText>
          <InfoText>고객센터: wapeople000@gmail.com</InfoText>
        </FooterInfo>
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
  max-width: 800px;
  margin: 0 auto;
  
  /* PC 환경에서 여백 증가 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.xl};
    max-width: 900px;
  }
`;

const PageTitle = styled.h1`
  font-size: ${theme.typography.pageTitle.fontSize};
  font-weight: ${theme.typography.pageTitle.fontWeight};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
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
`;

const Section = styled.section`
  margin-bottom: ${theme.spacing.xl};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.typography.sectionTitle.fontSize};
  font-weight: ${theme.typography.sectionTitle.fontWeight};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
`;

const Form = styled.div``;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const AmountInputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  input {
    padding-right: 40px;
  }
`;

const AmountUnit = styled.span`
  position: absolute;
  right: 16px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
  pointer-events: none;
`;

const FileInputWrapper = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
`;

const FileInputDisplay = styled.div`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  background-color: ${theme.colors.background.primary};
`;

const FileSelectButton = styled.button`
  padding: 12px 24px;
  background-color: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  
  &:hover {
    opacity: 0.8;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const SubmitButton = styled(StyledButton)`
  width: 100%;
  margin-top: ${theme.spacing.xl};
  
  /* PC 환경에서 버튼 너비 조정 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    width: auto;
    min-width: 200px;
    display: block;
    margin-left: auto;
    margin-right: auto;
  }
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.md};
  flex-wrap: wrap;
  gap: ${theme.spacing.xs};
`;

const FooterLink = styled.a`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Separator = styled.span`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
`;

const FooterInfo = styled.div`
  text-align: center;
  padding: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.border};
`;

const CompanyName = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const InfoText = styled.div`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
  margin-bottom: 4px;
`;

/* 서브탭 스타일 */
const SubTabContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
  border-bottom: 2px solid ${theme.colors.border};
`;

const SubTab = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.$active ? theme.colors.button.primary : 'transparent'};
  color: ${props => props.$active ? theme.colors.text.primary : theme.colors.text.secondary};
  font-size: 16px;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;

  &:hover {
    color: ${theme.colors.text.primary};
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    flex: 1;
    font-size: 14px;
    padding: ${theme.spacing.sm} ${theme.spacing.md};
  }
`;

/* 내역 목록 스타일 */
const ListHeader = styled.div`
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

const FilterContainer = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border: 2px solid ${props => props.$active ? theme.colors.button.primary : theme.colors.border};
  background-color: ${props => props.$active ? theme.colors.button.primary : 'white'};
  color: ${props => props.$active ? theme.colors.text.primary : theme.colors.text.secondary};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.button.primary};
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    flex: 1;
    min-width: 60px;
    font-size: 12px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
`;

/* 테이블 스타일 */
const ExpenseTable = styled.table`
  width: 100%;
  background-color: white;
  border-collapse: collapse;
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 12px;
  }
`;

const TableHeader = styled.th`
  background-color: ${theme.colors.background.secondary};
  padding: ${theme.spacing.md};
  text-align: left;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  border-bottom: 2px solid ${theme.colors.border};
  white-space: nowrap;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: ${theme.spacing.sm};
    font-size: 12px;
  }
`;

const TableCell = styled.td<{ $highlight?: boolean }>`
  padding: ${theme.spacing.md};
  border-bottom: 1px solid ${theme.colors.border};
  color: ${props => props.$highlight ? '#2196f3' : theme.colors.text.primary};
  font-weight: ${props => props.$highlight ? '600' : '400'};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: ${theme.spacing.sm};
    font-size: 12px;
  }
`;

const StatusBadge = styled.span<{ $status: 'pending' | 'approved' | 'rejected' }>`
  display: inline-block;
  padding: 4px 10px;
  border-radius: ${theme.borderRadius.medium};
  background-color: ${props => {
    switch (props.$status) {
      case 'pending': return '#fff3e0';
      case 'approved': return '#e8f5e9';
      case 'rejected': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'pending': return '#ff9800';
      case 'approved': return '#4caf50';
      case 'rejected': return '#f44336';
      default: return '#666';
    }
  }};
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 11px;
    padding: 3px 8px;
  }
`;

const DetailButton = styled.button`
  padding: 6px 12px;
  background-color: white;
  border: 1px solid ${theme.colors.button.primary};
  color: ${theme.colors.text.primary};
  border-radius: ${theme.borderRadius.medium};
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: ${theme.colors.button.primary};
  }

  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 11px;
    padding: 4px 8px;
  }
`;

/* 모달 스타일 */
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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
  border-radius: ${theme.borderRadius.large};
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
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 28px;
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: ${theme.colors.text.primary};
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const DetailRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: ${theme.spacing.xs};
  }
`;

const DetailLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
  min-width: 100px;
  flex-shrink: 0;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    min-width: auto;
    font-size: 13px;
  }
`;

const DetailValue = styled.span<{ $highlight?: boolean; $error?: boolean }>`
  font-size: 14px;
  color: ${props => props.$error ? '#f44336' : props.$highlight ? '#2196f3' : theme.colors.text.primary};
  font-weight: ${props => props.$highlight ? '600' : '400'};
  word-break: break-word;
  flex: 1;
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    font-size: 13px;
  }
`;

export default ExpenseEntryPage;

