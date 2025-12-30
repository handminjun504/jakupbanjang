import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { getWorkersBySite, updateWorker } from '../../api/foreman';
import { StyledInput, StyledTextarea } from '../../components/common/StyledInput';
import StyledButton from '../../components/common/StyledButton';
import Header from '../../components/common/Header';
import { theme } from '../../styles/theme';

const EditWorkerPage: React.FC = () => {
  const navigate = useNavigate();
  const { workerId } = useParams<{ workerId: string }>();
  
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    dailyRate: '',
    remarks: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchWorkerData();
  }, [workerId]);

  const fetchWorkerData = async () => {
    if (!workerId) return;

    try {
      setLoading(true);
      // 모든 근무자 목록에서 해당 ID를 찾기
      const workers = await getWorkersBySite();
      const worker = workers.find((w) => w.id === parseInt(workerId));
      
      if (!worker) {
        setError('근무자를 찾을 수 없습니다.');
        return;
      }

      setFormData({
        name: worker.name || '',
        phoneNumber: worker.phoneNumber || '',
        dailyRate: worker.dailyRate ? worker.dailyRate.toString() : '',
        remarks: worker.remarks || '',
      });
    } catch (error: any) {
      console.error('근무자 정보 조회 실패:', error);
      setError(error.message || '근무자 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    if (!workerId) {
      setError('근무자 ID가 없습니다.');
      return;
    }

    try {
      setSubmitting(true);
      await updateWorker(parseInt(workerId), {
        name: formData.name,
        phoneNumber: formData.phoneNumber || undefined,
        dailyRate: formData.dailyRate ? parseInt(formData.dailyRate) : undefined,
        remarks: formData.remarks || undefined,
      });
      
      setSuccess('근무자 정보가 수정되었습니다!');
      
      // 2초 후 근무자 목록으로 이동
      setTimeout(() => {
        navigate('/foreman/workers');
      }, 2000);
      
    } catch (err: any) {
      setError(err.message || '근무자 정보 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/foreman/workers');
  };

  if (loading) {
    return (
      <Container>
        <Header />
        <Content>
          <LoadingMessage>근무자 정보를 불러오는 중...</LoadingMessage>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header />
      
      <Content>
        <PageTitle>근무자 정보 수정</PageTitle>
        
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

          <InfoBox>
            <InfoIcon>ℹ️</InfoIcon>
            <InfoText>주민등록번호는 보안상 수정할 수 없습니다.</InfoText>
          </InfoBox>

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
              disabled={submitting}
            >
              취소
            </StyledButton>
            <StyledButton
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? '수정 중...' : '수정'}
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

const InfoBox = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  background-color: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.lg};
`;

const InfoIcon = styled.span`
  font-size: 20px;
`;

const InfoText = styled.p`
  font-size: 13px;
  color: #1565c0;
  margin: 0;
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

const LoadingMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
  font-size: 16px;
`;

export default EditWorkerPage;

