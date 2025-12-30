import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { createWorker } from '../../api/foreman';
import { StyledInput, StyledTextarea } from '../../components/common/StyledInput';
import StyledButton from '../../components/common/StyledButton';
import Header from '../../components/common/Header';
import { theme } from '../../styles/theme';

const AddWorkerPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    rrn: '',
    phoneNumber: '',
    dailyRate: '',
    remarks: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // 주민번호 자동 하이픈 추가
    if (name === 'rrn') {
      let cleanValue = value.replace(/[^0-9]/g, '');
      if (cleanValue.length > 6) {
        cleanValue = cleanValue.slice(0, 6) + '-' + cleanValue.slice(6, 13);
      }
      setFormData(prev => ({
        ...prev,
        [name]: cleanValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // 필수 필드 검증
    if (!formData.name.trim()) {
      setError('이름은 필수 항목입니다.');
      return;
    }

    if (!formData.rrn.trim()) {
      setError('주민등록번호는 필수 항목입니다.');
      return;
    }

    // 주민번호 형식 검증 (13자리)
    const cleanRRN = formData.rrn.replace(/-/g, '');
    if (cleanRRN.length !== 13) {
      setError('주민등록번호는 13자리여야 합니다.');
      return;
    }

    try {
      setLoading(true);
      await createWorker({
        name: formData.name,
        rrn: formData.rrn,
        phoneNumber: formData.phoneNumber || undefined,
        dailyRate: formData.dailyRate ? parseInt(formData.dailyRate) : undefined,
        remarks: formData.remarks || undefined,
      });
      
      setSuccess('근무자가 성공적으로 추가되었습니다!');
      
      // 2초 후 근무자 목록으로 이동
      setTimeout(() => {
        navigate('/foreman/workers');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || '근무자 추가에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/foreman/workers');
  };

  return (
    <Container>
      <Header />
      
      <Content>
        <PageTitle>근무자 등록</PageTitle>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">
              이름 <Required>*</Required>
            </Label>
            <StyledInput
              id="name"
              name="name"
              type="text"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="rrn">
              주민등록번호 <Required>*</Required>
            </Label>
            <StyledInput
              id="rrn"
              name="rrn"
              type="text"
              placeholder="000000-0000000"
              value={formData.rrn}
              onChange={handleChange}
              maxLength={14}
              required
            />
            <HelpText>하이픈(-)은 자동으로 입력됩니다</HelpText>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="phoneNumber">연락처</Label>
            <StyledInput
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="010-0000-0000"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="dailyRate">단가 (원)</Label>
            <StyledInput
              id="dailyRate"
              name="dailyRate"
              type="number"
              placeholder="일일 단가를 입력하세요"
              value={formData.dailyRate}
              onChange={handleChange}
              min="0"
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="remarks">비고</Label>
            <StyledTextarea
              id="remarks"
              name="remarks"
              placeholder="특이사항이나 메모를 입력하세요"
              value={formData.remarks}
              onChange={handleChange}
              rows={4}
            />
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}
          {success && <SuccessMessage>{success}</SuccessMessage>}

          <ButtonGroup>
            <StyledButton
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={loading}
            >
              취소
            </StyledButton>
            <StyledButton
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? '등록 중...' : '등록'}
            </StyledButton>
          </ButtonGroup>
        </Form>
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
  max-width: 600px;
  margin: 0 auto;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
`;

const Form = styled.form`
  background-color: ${theme.colors.background.secondary};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.medium};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const Required = styled.span`
  color: #f44336;
`;

const HelpText = styled.p`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.xs};
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;

const ErrorMessage = styled.div`
  padding: ${theme.spacing.md};
  background-color: #ffeaea;
  border: 1px solid #ffcdd2;
  border-radius: ${theme.borderRadius.medium};
  color: #c62828;
  font-size: 14px;
  margin-bottom: ${theme.spacing.md};
`;

const SuccessMessage = styled.div`
  padding: ${theme.spacing.md};
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
  border-radius: ${theme.borderRadius.medium};
  color: #2e7d32;
  font-size: 14px;
  margin-bottom: ${theme.spacing.md};
`;

export default AddWorkerPage;
