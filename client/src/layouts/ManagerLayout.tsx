import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';
import { logout } from '../utils/auth';

const ManagerLayout: React.FC = () => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    logout();
    navigate('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <Container>
      <Sidebar>
        <LogoSection>
          <Logo>JAKUP</Logo>
          <RoleTag>관리자</RoleTag>
        </LogoSection>

        <Nav>
          <NavItem to="/manager/dashboard">
            <NavIcon>📊</NavIcon>
            <NavText>대시보드</NavText>
          </NavItem>
          <NavItem to="/manager/sites">
            <NavIcon>🏗️</NavIcon>
            <NavText>현장 관리</NavText>
          </NavItem>
          <NavItem to="/manager/worklogs">
            <NavIcon>📋</NavIcon>
            <NavText>작업일지</NavText>
          </NavItem>
          <NavItem to="/manager/workers">
            <NavIcon>👷</NavIcon>
            <NavText>근무자 목록</NavText>
          </NavItem>
          <NavItem to="/manager/expenses">
            <NavIcon>💰</NavIcon>
            <NavText>지출결의</NavText>
          </NavItem>
          <NavItem to="/manager/aggregation">
            <NavIcon>📊</NavIcon>
            <NavText>집계</NavText>
          </NavItem>
        </Nav>

        <LogoutButton onClick={handleLogoutClick}>
          <NavIcon>🚪</NavIcon>
          <NavText>로그아웃</NavText>
        </LogoutButton>
      </Sidebar>

      <MainContent>
        <Outlet />
      </MainContent>

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
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${theme.colors.background.primary};
`;

const Sidebar = styled.aside`
  width: 260px;
  background-color: ${theme.colors.background.primary};
  border-right: 1px solid ${theme.colors.border};
  display: flex;
  flex-direction: column;
  padding: ${theme.spacing.lg};
  position: fixed;
  height: 100vh;
  overflow-y: auto;

  /* 모바일에서는 숨김 (PC 전용) */
  @media (max-width: ${theme.breakpoints.tablet}) {
    display: none;
  }
`;

const LogoSection = styled.div`
  margin-bottom: ${theme.spacing.xl};
  text-align: center;
`;

const Logo = styled.div`
  background-color: ${theme.colors.accent};
  color: ${theme.colors.text.primary};
  padding: 12px 24px;
  border-radius: ${theme.borderRadius.round};
  font-weight: 700;
  font-size: 20px;
  display: inline-block;
  margin-bottom: ${theme.spacing.sm};
`;

const RoleTag = styled.div`
  font-size: 12px;
  color: ${theme.colors.text.secondary};
  font-weight: 600;
`;

const Nav = styled.nav`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  text-decoration: none;
  color: ${theme.colors.text.primary};
  transition: all 0.2s;

  &:hover {
    background-color: ${theme.colors.background.secondary};
  }

  &.active {
    background-color: ${theme.colors.accent};
    font-weight: 600;
  }
`;

const NavIcon = styled.span`
  font-size: 20px;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const NavText = styled.span`
  font-size: 15px;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  text-decoration: none;
  color: ${theme.colors.text.secondary};
  background: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: auto;

  &:hover {
    background-color: ${theme.colors.background.secondary};
    color: ${theme.colors.text.primary};
  }
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 260px;
  padding: ${theme.spacing.xl};
  min-height: 100vh;

  /* 모바일에서는 전체 너비 */
  @media (max-width: ${theme.breakpoints.tablet}) {
    margin-left: 0;
    padding: ${theme.spacing.md};
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

export default ManagerLayout;

