import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { useSiteStore } from '../../store/siteStore';
import { getSites } from '../../api/foreman';

interface HeaderProps {
  onLogout?: () => void;
  showBackButton?: boolean;
  showSiteSelector?: boolean;
}

interface Site {
  id: number;
  name: string;
  address?: string;
  status: string;
}

const Header: React.FC<HeaderProps> = ({ onLogout, showBackButton = true, showSiteSelector = false }) => {
  const navigate = useNavigate();
  const { selectedSiteId, selectedSite, setSelectedSite } = useSiteStore();
  const [sites, setSites] = useState<Site[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    if (showSiteSelector) {
      fetchSites();
    }
  }, [showSiteSelector]);

  const fetchSites = async () => {
    try {
      const sites = await getSites();
      setSites(sites);
    } catch (error) {
      console.error('현장 목록 조회 실패:', error);
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    if (onLogout) {
      onLogout();
    } else {
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const siteId = parseInt(e.target.value);
    const site = sites.find(s => s.id === siteId);
    if (site) {
      setSelectedSite(siteId, site);
      // 현재 페이지 새로고침
      window.location.reload();
    }
  };

  return (
    <HeaderContainer>
      <LeftSection>
        {showBackButton && (
          <BackButton onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </BackButton>
        )}
      </LeftSection>
      
      <CenterSection>
        <Logo>JAKUP</Logo>
        {showSiteSelector && sites.length > 0 && (
          <SiteSelector value={selectedSiteId || ''} onChange={handleSiteChange}>
            <option value="">현장 선택</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>
                {site.name}
              </option>
            ))}
          </SiteSelector>
        )}
      </CenterSection>
      
      <RightSection>
        <LogoutButton onClick={handleLogoutClick}>
          <IconWrapper>🚪</IconWrapper>
          <ButtonText>로그아웃</ButtonText>
        </LogoutButton>
      </RightSection>

      {showLogoutModal && (
        <ModalOverlay onClick={handleLogoutCancel}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalIcon>🚪</ModalIcon>
            <ModalTitle>로그아웃 하시겠습니까?</ModalTitle>
            <ModalButtons>
              <CancelButton onClick={handleLogoutCancel}>취소</CancelButton>
              <ConfirmButton onClick={handleLogoutConfirm}>로그아웃</ConfirmButton>
            </ModalButtons>
          </ModalContent>
        </ModalOverlay>
      )}
    </HeaderContainer>
  );
};

const HeaderContainer = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: ${theme.colors.background.primary};
  border-bottom: 1px solid ${theme.colors.border};
  min-height: 56px;
  position: relative;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 16px 32px;
    min-height: 64px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  min-width: 40px;
`;

const BackButton = styled.button`
  background: none;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.text.primary};
  min-width: 40px;
  min-height: 40px;
  
  &:hover {
    opacity: 0.7;
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

const CenterSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 8px;
  min-width: 0;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    flex-direction: row;
    gap: 16px;
  }
`;

const Logo = styled.div`
  background-color: ${theme.colors.accent};
  color: ${theme.colors.text.primary};
  padding: 6px 16px;
  border-radius: ${theme.borderRadius.round};
  font-weight: 700;
  font-size: 14px;
  white-space: nowrap;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 8px 24px;
    font-size: 16px;
  }
`;

const SiteSelector = styled.select`
  padding: 6px 10px;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  background-color: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  max-width: 120px;
  min-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:hover {
    border-color: ${theme.colors.text.secondary};
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 14px;
    padding: 6px 12px;
    max-width: 200px;
  }
`;

const RightSection = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  min-width: 70px;
`;

const LogoutButton = styled.button`
  background: none;
  color: ${theme.colors.text.primary};
  font-size: 12px;
  padding: 8px;
  white-space: nowrap;
  min-width: 60px;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &:hover {
    opacity: 0.7;
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 14px;
    padding: 4px 8px;
    gap: 6px;
  }
`;

const IconWrapper = styled.span`
  font-size: 16px;
  display: flex;
  align-items: center;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 18px;
  }
`;

const ButtonText = styled.span`
  font-size: 12px;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 14px;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background-color: ${theme.colors.background.primary};
  border-radius: ${theme.borderRadius.large};
  padding: 32px 24px;
  min-width: 280px;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 40px 32px;
    min-width: 320px;
  }
`;

const ModalIcon = styled.div`
  font-size: 48px;
  margin-bottom: 8px;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 56px;
  }
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${theme.colors.text.primary};
  text-align: center;
  margin: 0;
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    font-size: 20px;
  }
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 12px;
  width: 100%;
  margin-top: 8px;
`;

const CancelButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background-color: ${theme.colors.background.secondary};
  color: ${theme.colors.text.primary};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #E9ECEF;
    border-color: ${theme.colors.text.secondary};
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 14px 28px;
    font-size: 15px;
  }
`;

const ConfirmButton = styled.button`
  flex: 1;
  padding: 12px 24px;
  background-color: ${theme.colors.accent};
  color: ${theme.colors.text.primary};
  border: 2px solid ${theme.colors.accent};
  border-radius: ${theme.borderRadius.medium};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #FFC107;
    border-color: #FFC107;
  }
  
  &:active {
    transform: scale(0.98);
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 14px 28px;
    font-size: 15px;
  }
`;

export default Header;

