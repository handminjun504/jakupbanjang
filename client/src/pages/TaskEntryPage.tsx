import React, { useState } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/common/Header';
import StyledButton from '../components/common/StyledButton';
import { StyledInput, StyledSelect, StyledTextarea } from '../components/common/StyledInput';
import { theme } from '../styles/theme';

const TaskEntryPage: React.FC = () => {
  const { workerId } = useParams<{ workerId: string }>();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    date: '2024.08.14(수)',
    siteName: '정글리 공사',
    workerName: '210403 가나다',
    taskContent: '',
    workHours: '',
    notes: '',
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleWorkHoursChange = (hours: string) => {
    setFormData(prev => ({
      ...prev,
      workHours: hours,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.taskContent) {
      alert('작업내용을 선택해주세요.');
      return;
    }
    
    if (!formData.workHours) {
      alert('공수를 선택해주세요.');
      return;
    }
    
    try {
      // TODO: API 호출하여 작업 공수 저장
      alert('작업 공수가 저장되었습니다.');
      navigate(-1);
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <Container>
      <Header />
      
      <Content>
        <PageTitle>작업공수입력 [{formData.workerName}]</PageTitle>
        
        <Form>
          <FormRow>
            <FormLabel>날짜</FormLabel>
            <FormValue>{formData.date}</FormValue>
          </FormRow>
          
          <FormRow>
            <FormLabel>현장명</FormLabel>
            <FormValue>{formData.siteName}</FormValue>
          </FormRow>
          
          <FormRow>
            <FormLabel>근무자명</FormLabel>
            <FormValue>{formData.workerName}</FormValue>
          </FormRow>
          
          <FormGroup>
            <Label>작업내용</Label>
            <StyledSelect
              name="taskContent"
              value={formData.taskContent}
              onChange={handleInputChange}
            >
              <option value="">작업내용</option>
              <option value="철근작업">철근작업</option>
              <option value="형틀작업">형틀작업</option>
              <option value="미장작업">미장작업</option>
              <option value="기타">기타</option>
            </StyledSelect>
          </FormGroup>
          
          <FormGroup>
            <Label>첨부파일</Label>
            <FileInputWrapper>
              <FileInputDisplay>
                {selectedFile ? selectedFile.name : '파일이 선택되지 않았습니다'}
              </FileInputDisplay>
              <FileSelectButton onClick={() => document.getElementById('file-input')?.click()}>
                파일선택
              </FileSelectButton>
              <HiddenFileInput
                id="file-input"
                type="file"
                onChange={handleFileChange}
              />
            </FileInputWrapper>
          </FormGroup>
          
          <FormGroup>
            <Label>공수</Label>
            <RadioGroup>
              <RadioOption>
                <RadioInput
                  type="radio"
                  id="hours-1"
                  name="workHours"
                  value="1"
                  checked={formData.workHours === '1'}
                  onChange={() => handleWorkHoursChange('1')}
                />
                <RadioLabel htmlFor="hours-1">1</RadioLabel>
              </RadioOption>
              
              <RadioOption>
                <RadioInput
                  type="radio"
                  id="hours-2"
                  name="workHours"
                  value="2"
                  checked={formData.workHours === '2'}
                  onChange={() => handleWorkHoursChange('2')}
                />
                <RadioLabel htmlFor="hours-2">2</RadioLabel>
              </RadioOption>
              
              <RadioOption>
                <RadioInput
                  type="radio"
                  id="hours-3"
                  name="workHours"
                  value="3"
                  checked={formData.workHours === '3'}
                  onChange={() => handleWorkHoursChange('3')}
                />
                <RadioLabel htmlFor="hours-3">3</RadioLabel>
              </RadioOption>
            </RadioGroup>
          </FormGroup>
          
          <FormGroup>
            <Label>비고</Label>
            <StyledTextarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="비고 사항을 입력하세요"
            />
          </FormGroup>
        </Form>
        
        <ButtonGroup>
          <StyledButton variant="secondary" onClick={handleCancel}>
            뒤로가기
          </StyledButton>
          <StyledButton onClick={handleSubmit}>
            저장
          </StyledButton>
        </ButtonGroup>
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

const Form = styled.div`
  margin-bottom: ${theme.spacing.xl};
  
  /* PC 환경에서 2단 그리드 레이아웃 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: ${theme.spacing.lg};
    
    /* FormRow는 그리드를 무시하고 전체 너비 차지 */
    > div:nth-child(1),
    > div:nth-child(2),
    > div:nth-child(3) {
      grid-column: 1 / -1;
    }
  }
`;

const FormRow = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.border};
  padding: 16px 0;
  
  /* PC 환경에서 간격 조정 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 20px 0;
  }
`;

const FormLabel = styled.div`
  flex: 0 0 120px;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`;

const FormValue = styled.div`
  flex: 1;
  font-size: 14px;
  color: ${theme.colors.text.primary};
`;

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

const RadioGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
`;

const RadioOption = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const RadioInput = styled.input`
  width: 20px;
  height: 20px;
  cursor: pointer;
`;

const RadioLabel = styled.label`
  font-size: 16px;
  color: ${theme.colors.text.primary};
  cursor: pointer;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  justify-content: center;
  
  button {
    flex: 1;
    max-width: 200px;
  }
  
  /* PC 환경에서 버튼 스타일 조정 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    gap: ${theme.spacing.lg};
    
    button {
      flex: 0 1 auto;
      min-width: 150px;
    }
  }
`;

export default TaskEntryPage;

