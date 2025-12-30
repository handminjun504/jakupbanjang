import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getSites } from '../../api/foreman';
import { useSiteStore } from '../../store/siteStore';
import { theme } from '../../styles/theme';

interface Site {
  id: number;
  name: string;
  address?: string;
  startDate?: string;
  endDate?: string;
  status: string;
}

const SiteSelectionPage: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setSelectedSite } = useSiteStore();

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const sites = await getSites();
      setSites(sites);
    } catch (err: any) {
      setError(err.message || '현장 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSiteSelect = (site: Site) => {
    setSelectedSite(site.id, site);
    navigate('/foreman/tasks');
  };

  if (loading) {
    return (
      <Container>
        <Card>
          <LoadingText>현장 목록을 불러오는 중...</LoadingText>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Card>
          <ErrorText>{error}</ErrorText>
          <RetryButton onClick={fetchSites}>다시 시도</RetryButton>
        </Card>
      </Container>
    );
  }

  return (
    <Container>
      <Card>
        <Title>현장 선택</Title>
        <Description>작업할 현장을 선택해주세요</Description>
        
        {sites.length === 0 ? (
          <EmptyMessage>
            <EmptyIcon>📋</EmptyIcon>
            <EmptyText>등록된 현장이 없습니다.</EmptyText>
            <EmptySubText>관리자에게 문의하세요.</EmptySubText>
          </EmptyMessage>
        ) : (
          <SiteList>
            {sites.map((site) => (
              <SiteCard key={site.id} onClick={() => handleSiteSelect(site)}>
                <SiteHeader>
                  <SiteName>{site.name}</SiteName>
                  <StatusBadge status={site.status}>
                    {site.status === 'active' ? '진행중' : site.status === 'completed' ? '완료' : '중단'}
                  </StatusBadge>
                </SiteHeader>
                
                {site.address && (
                  <SiteAddress>📍 {site.address}</SiteAddress>
                )}
                
                {(site.startDate || site.endDate) && (
                  <SiteDates>
                    {site.startDate && <DateText>시작: {site.startDate}</DateText>}
                    {site.endDate && <DateText>종료: {site.endDate}</DateText>}
                  </SiteDates>
                )}
                
                <SelectButton>
                  선택하기 →
                </SelectButton>
              </SiteCard>
            ))}
          </SiteList>
        )}
      </Card>
    </Container>
  );
};

export default SiteSelectionPage;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 2rem;
  }
`;

const Card = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  padding: ${theme.spacing.lg};
  max-width: 900px;
  width: 100%;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    border-radius: 16px;
    padding: 3rem;
  }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${theme.colors.text.primary};
  margin-bottom: 0.5rem;
  text-align: center;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 2rem;
  }
`;

const Description = styled.p`
  font-size: 0.875rem;
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 1rem;
    margin-bottom: 2rem;
  }
`;

const SiteList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }
`;

const SiteCard = styled.div`
  background: ${theme.colors.background.secondary};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${theme.colors.primary};
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 1.5rem;
    border-radius: 12px;
  }
`;

const SiteHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const SiteName = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  margin: 0;
  flex: 1;
  word-break: keep-all;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 1.25rem;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  font-size: 0.625rem;
  padding: 0.25rem 0.625rem;
  border-radius: 12px;
  font-weight: 600;
  white-space: nowrap;
  background: ${props => 
    props.status === 'active' ? '#10b981' : 
    props.status === 'completed' ? '#6b7280' : 
    '#ef4444'};
  color: white;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 0.75rem;
    padding: 0.25rem 0.75rem;
  }
`;

const SiteAddress = styled.p`
  font-size: 0.8125rem;
  color: ${theme.colors.text.secondary};
  margin: ${theme.spacing.sm} 0;
  line-height: 1.5;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 0.875rem;
  }
`;

const SiteDates = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  margin: ${theme.spacing.sm} 0;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    flex-direction: row;
    gap: 1rem;
    margin: 0.75rem 0;
  }
`;

const DateText = styled.span`
  font-size: 0.75rem;
  color: ${theme.colors.text.secondary};
`;

const SelectButton = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.sm};
  text-align: center;
  color: ${theme.colors.primary};
  font-weight: 600;
  font-size: 0.875rem;
  border-top: 1px solid ${theme.colors.border};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    margin-top: 1rem;
    padding: 0.5rem;
    border-top: none;
  }
`;

const EmptyMessage = styled.div`
  text-align: center;
  padding: ${theme.spacing.xl} ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 3rem 1rem;
  }
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: ${theme.colors.text.primary};
  font-weight: 600;
  margin-bottom: ${theme.spacing.sm};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 1.125rem;
  }
`;

const EmptySubText = styled.p`
  font-size: 0.8125rem;
  color: ${theme.colors.text.secondary};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 0.875rem;
  }
`;

const LoadingText = styled.p`
  text-align: center;
  font-size: 1rem;
  color: ${theme.colors.text.secondary};
  padding: ${theme.spacing.xl};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 1.125rem;
    padding: 3rem;
  }
`;

const ErrorText = styled.p`
  text-align: center;
  font-size: 0.875rem;
  color: ${theme.colors.error};
  margin-bottom: ${theme.spacing.md};
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
`;

const RetryButton = styled.button`
  display: block;
  margin: 0 auto;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 200px;

  &:hover {
    background: ${theme.colors.primaryDark};
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    width: auto;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    border-radius: 8px;
  }
`;

