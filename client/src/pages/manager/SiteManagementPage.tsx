import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { getSites, createSite, updateSite, deleteSite, Site, getForemen, assignForemenToSite, Foreman } from '../../api/admin';
import StyledButton from '../../components/common/StyledButton';
import { StyledInput, StyledTextarea, StyledSelect } from '../../components/common/StyledInput';

type SiteFormData = {
  name: string;
  address: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'suspended';
};

const SiteManagementPage: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [foremen, setForemen] = useState<Foreman[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [selectedForemenIds, setSelectedForemenIds] = useState<number[]>([]);
  
  // 새 현장 생성 폼
  const [newSite, setNewSite] = useState<SiteFormData>({
    name: '',
    address: '',
    startDate: '',
    endDate: '',
    status: 'active'
  });

  useEffect(() => {
    fetchSites();
    fetchForemen();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const data = await getSites();
      setSites(data);
      setError('');
    } catch (err: any) {
      setError(err.message || '현장 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchForemen = async () => {
    try {
      const data = await getForemen();
      setForemen(data);
    } catch (err: any) {
      console.error('작업반장 목록 조회 실패:', err);
    }
  };

  const handleCreateSite = async () => {
    if (!newSite.name) {
      alert('현장명을 입력해주세요.');
      return;
    }

    try {
      let siteId: number;
      
      if (editingSite) {
        // 수정
        await updateSite(editingSite.id, newSite);
        siteId = editingSite.id;
        alert('현장이 수정되었습니다.');
      } else {
        // 생성
        const created = await createSite(newSite);
        siteId = created.id;
        alert('현장이 생성되었습니다.');
      }

      // 작업반장 할당
      if (selectedForemenIds.length > 0) {
        await assignForemenToSite(siteId, selectedForemenIds);
      } else {
        // 작업반장이 선택되지 않았으면 기존 할당 모두 제거
        await assignForemenToSite(siteId, []);
      }

      handleCloseModal();
      fetchSites();
    } catch (err: any) {
      alert(err.message || '현장 저장에 실패했습니다.');
    }
  };

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    setNewSite({
      name: site.name,
      address: site.address || '',
      startDate: site.startDate || '',
      endDate: site.endDate || '',
      status: site.status
    });
    // 현재 할당된 작업반장 ID 설정
    setSelectedForemenIds(site.assignedForemen?.map(f => f.id) || []);
    setShowModal(true);
  };

  const handleDelete = async (site: Site) => {
    if (!window.confirm(`정말로 "${site.name}" 현장을 삭제하시겠습니까?\n\n⚠️ 이 작업은 되돌릴 수 없습니다.`)) {
      return;
    }

    try {
      await deleteSite(site.id);
      alert('현장이 삭제되었습니다.');
      fetchSites();
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || '현장 삭제에 실패했습니다.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSite(null);
    setNewSite({ name: '', address: '', startDate: '', endDate: '', status: 'active' as const });
    setSelectedForemenIds([]);
  };

  const handleForemanToggle = (foremanId: number) => {
    setSelectedForemenIds(prev => {
      if (prev.includes(foremanId)) {
        return prev.filter(id => id !== foremanId);
      } else {
        return [...prev, foremanId];
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <StatusBadge $status="active">진행중</StatusBadge>;
      case 'completed':
        return <StatusBadge $status="completed">완료</StatusBadge>;
      case 'suspended':
        return <StatusBadge $status="suspended">중단</StatusBadge>;
      default:
        return <StatusBadge $status="active">{status}</StatusBadge>;
    }
  };

  if (loading) {
    return (
      <Container>
        <PageTitle>현장 관리</PageTitle>
        <LoadingMessage>데이터를 불러오는 중...</LoadingMessage>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderContent>
          <PageTitle>현장 관리</PageTitle>
          <Subtitle>모든 현장을 관리하세요</Subtitle>
        </HeaderContent>
        <StyledButton onClick={() => setShowModal(true)}>
          + 새 현장 추가
        </StyledButton>
      </Header>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* 데스크톱: 테이블 뷰 */}
      <DesktopTable>
        <Table>
          <thead>
            <TableRow>
              <TableHeader>ID</TableHeader>
              <TableHeader>현장명</TableHeader>
              <TableHeader>주소</TableHeader>
              <TableHeader>상태</TableHeader>
              <TableHeader>할당 반장</TableHeader>
              <TableHeader>시작일</TableHeader>
              <TableHeader>종료일</TableHeader>
              <TableHeader>등록일</TableHeader>
              <TableHeader>관리</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {sites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} style={{ textAlign: 'center' }}>
                  등록된 현장이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell>{site.id}</TableCell>
                  <TableCell><strong>{site.name}</strong></TableCell>
                  <TableCell>{site.address || '-'}</TableCell>
                  <TableCell>{getStatusBadge(site.status)}</TableCell>
                  <TableCell>
                    {site.assignedForemen && site.assignedForemen.length > 0 ? (
                      <ForemanBadges>
                        {site.assignedForemen.map(f => (
                          <ForemanBadge key={f.id}>{f.name || f.phone}</ForemanBadge>
                        ))}
                      </ForemanBadges>
                    ) : (
                      <span style={{ color: '#999' }}>미할당</span>
                    )}
                  </TableCell>
                  <TableCell>{site.startDate || '-'}</TableCell>
                  <TableCell>{site.endDate || '-'}</TableCell>
                  <TableCell>{new Date(site.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <ActionButtons>
                      <ActionButton onClick={() => handleEdit(site)}>수정</ActionButton>
                      <DeleteButton onClick={() => handleDelete(site)}>삭제</DeleteButton>
                    </ActionButtons>
                  </TableCell>
                </TableRow>
              ))
            )}
          </tbody>
        </Table>
      </DesktopTable>

      {/* 모바일: 카드 뷰 */}
      <MobileCards>
        {sites.length === 0 ? (
          <EmptyState>등록된 현장이 없습니다.</EmptyState>
        ) : (
          sites.map((site) => (
            <SiteCard key={site.id}>
              <CardHeader>
                <SiteName>{site.name}</SiteName>
                {getStatusBadge(site.status)}
              </CardHeader>
              
              <CardBody>
                <CardRow>
                  <CardLabel>주소</CardLabel>
                  <CardValue>{site.address || '-'}</CardValue>
                </CardRow>
                
                <CardRow>
                  <CardLabel>시작일</CardLabel>
                  <CardValue>{site.startDate || '-'}</CardValue>
                </CardRow>
                
                <CardRow>
                  <CardLabel>종료일</CardLabel>
                  <CardValue>{site.endDate || '-'}</CardValue>
                </CardRow>
                
                <CardRow>
                  <CardLabel>등록일</CardLabel>
                  <CardValue>{new Date(site.createdAt).toLocaleDateString()}</CardValue>
                </CardRow>

                <CardRow>
                  <CardLabel>할당 반장</CardLabel>
                  <CardValue>
                    {site.assignedForemen && site.assignedForemen.length > 0 ? (
                      <ForemanBadges>
                        {site.assignedForemen.map(f => (
                          <ForemanBadge key={f.id}>{f.name || f.phone}</ForemanBadge>
                        ))}
                      </ForemanBadges>
                    ) : (
                      <span style={{ color: '#999' }}>미할당</span>
                    )}
                  </CardValue>
                </CardRow>
              </CardBody>
              
              <CardFooter>
                <ActionButton onClick={() => handleEdit(site)}>수정</ActionButton>
                <DeleteButton onClick={() => handleDelete(site)}>삭제</DeleteButton>
              </CardFooter>
            </SiteCard>
          ))
        )}
      </MobileCards>

      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>{editingSite ? '현장 수정' : '새 현장 추가'}</ModalTitle>
            
            <FormGroup>
              <Label>현장명 *</Label>
              <StyledInput
                value={newSite.name}
                onChange={(e) => setNewSite({ ...newSite, name: e.target.value })}
                placeholder="예: 정글리 공사"
              />
            </FormGroup>

            <FormGroup>
              <Label>주소</Label>
              <StyledTextarea
                value={newSite.address}
                onChange={(e) => setNewSite({ ...newSite, address: e.target.value })}
                placeholder="현장 주소를 입력하세요"
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <Label>시작일</Label>
                <StyledInput
                  type="date"
                  value={newSite.startDate}
                  onChange={(e) => setNewSite({ ...newSite, startDate: e.target.value })}
                />
              </FormGroup>

              <FormGroup>
                <Label>종료일</Label>
                <StyledInput
                  type="date"
                  value={newSite.endDate}
                  onChange={(e) => setNewSite({ ...newSite, endDate: e.target.value })}
                />
              </FormGroup>
            </FormRow>

            {editingSite && (
              <FormGroup>
                <Label>상태</Label>
                <StyledSelect
                  value={newSite.status}
                  onChange={(e) => setNewSite({ ...newSite, status: e.target.value as 'active' | 'completed' | 'suspended' })}
                >
                  <option value="active">진행중</option>
                  <option value="completed">완료</option>
                  <option value="suspended">중단</option>
                </StyledSelect>
              </FormGroup>
            )}

            <FormGroup>
              <Label>작업반장 할당</Label>
              <ForemanList>
                {foremen.length === 0 ? (
                  <EmptyForeman>등록된 작업반장이 없습니다.</EmptyForeman>
                ) : (
                  foremen.map((foreman) => (
                    <ForemanItem key={foreman.id}>
                      <Checkbox
                        type="checkbox"
                        id={`foreman-${foreman.id}`}
                        checked={selectedForemenIds.includes(foreman.id)}
                        onChange={() => handleForemanToggle(foreman.id)}
                      />
                      <ForemanLabel htmlFor={`foreman-${foreman.id}`}>
                        <ForemanName>{foreman.name || '이름 없음'}</ForemanName>
                        <ForemanPhone>{foreman.phone}</ForemanPhone>
                      </ForemanLabel>
                    </ForemanItem>
                  ))
                )}
              </ForemanList>
            </FormGroup>

            <ButtonGroup>
              <StyledButton variant="secondary" onClick={handleCloseModal}>
                취소
              </StyledButton>
              <StyledButton onClick={handleCreateSite}>
                {editingSite ? '수정' : '생성'}
              </StyledButton>
            </ButtonGroup>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.xl};
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    flex-direction: row;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: ${theme.spacing.xl};
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${theme.colors.text.secondary};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 16px;
  }
`;

// 데스크톱 테이블 (768px 이상에서만 표시)
const DesktopTable = styled.div`
  display: none;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    display: block;
  }
`;

// 모바일 카드 (768px 미만에서만 표시)
const MobileCards = styled.div`
  display: block;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

const SiteCard = styled.div`
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  margin-bottom: ${theme.spacing.md};
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.secondary};
  border-bottom: 1px solid ${theme.colors.border};
`;

const SiteName = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const CardBody = styled.div`
  padding: ${theme.spacing.md};
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const CardLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.secondary};
`;

const CardValue = styled.span`
  font-size: 14px;
  color: ${theme.colors.text.primary};
  text-align: right;
`;

const CardFooter = styled.div`
  padding: ${theme.spacing.md};
  background-color: ${theme.colors.background.secondary};
  border-top: 1px solid ${theme.colors.border};
  display: flex;
  justify-content: flex-end;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl};
  color: ${theme.colors.text.secondary};
  background-color: ${theme.colors.background.secondary};
  border-radius: ${theme.borderRadius.medium};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background-color: ${theme.colors.background.primary};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: ${theme.colors.background.secondary};
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

const StatusBadge = styled.span<{ $status: string }>`
  padding: 4px 12px;
  border-radius: ${theme.borderRadius.small};
  font-size: 12px;
  font-weight: 600;
  
  ${props => props.$status === 'active' && `
    background-color: ${theme.colors.accent};
    color: ${theme.colors.text.primary};
  `}
  
  ${props => props.$status === 'completed' && `
    background-color: ${theme.colors.background.secondary};
    color: ${theme.colors.text.secondary};
  `}
  
  ${props => props.$status === 'suspended' && `
    background-color: #ffeaea;
    color: #e74c3c;
  `}
`;

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
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    padding: 0;
    align-items: flex-end;
  }
`;

const ModalContent = styled.div`
  background-color: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: ${theme.spacing.xl};
  }
  
  @media (max-width: ${theme.breakpoints.mobile}) {
    max-height: 85vh;
    border-radius: ${theme.borderRadius.medium} ${theme.borderRadius.medium} 0 0;
  }
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 20px;
    margin-bottom: ${theme.spacing.lg};
  }
`;

const FormGroup = styled.div`
  margin-bottom: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    margin-bottom: ${theme.spacing.lg};
  }
`;

const FormRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    flex-direction: row;
    gap: ${theme.spacing.md};
    justify-content: flex-end;
    margin-top: ${theme.spacing.xl};
  }
  
  button {
    width: 100%;
    
    @media (min-width: ${theme.breakpoints.tablet}) {
      width: auto;
      min-width: 100px;
    }
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

const ActionButtons = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: ${theme.borderRadius.small};
  cursor: pointer;
  transition: all 0.2s;
  background-color: ${theme.colors.accent};
  color: ${theme.colors.text.primary};

  &:hover {
    opacity: 0.8;
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const DeleteButton = styled.button`
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  border: none;
  border-radius: ${theme.borderRadius.small};
  cursor: pointer;
  transition: all 0.2s;
  background-color: #ffeaea;
  color: #e74c3c;

  &:hover {
    background-color: #e74c3c;
    color: white;
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const ForemanList = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.small};
  padding: ${theme.spacing.sm};
  max-height: 200px;
  overflow-y: auto;
  background-color: ${theme.colors.background.secondary};
`;

const ForemanItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const Checkbox = styled.input`
  margin-right: ${theme.spacing.sm};
  cursor: pointer;
  width: 18px;
  height: 18px;
`;

const ForemanLabel = styled.label`
  flex: 1;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ForemanName = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
`;

const ForemanPhone = styled.span`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
`;

const EmptyForeman = styled.div`
  text-align: center;
  padding: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
  font-size: 14px;
`;

const ForemanBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const ForemanBadge = styled.span`
  padding: 2px 8px;
  border-radius: ${theme.borderRadius.small};
  font-size: 11px;
  font-weight: 600;
  background-color: ${theme.colors.accent};
  color: ${theme.colors.text.primary};
  white-space: nowrap;
`;

export default SiteManagementPage;

