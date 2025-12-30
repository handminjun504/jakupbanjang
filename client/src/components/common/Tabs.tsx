import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
  return (
    <TabsContainer>
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          $active={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </TabItem>
      ))}
    </TabsContainer>
  );
};

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${theme.colors.border};
  background-color: ${theme.colors.background.primary};
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    max-width: ${theme.maxWidth.content};
    margin: 0 auto;
    width: 100%;
    overflow-x: visible;
  }
`;

const TabItem = styled.button<{ $active: boolean }>`
  flex: 1 0 auto;
  min-width: fit-content;
  padding: 12px 16px;
  background: none;
  border: none;
  font-size: 13px;
  font-weight: ${props => props.$active ? '700' : '500'};
  color: ${props => props.$active ? theme.colors.text.primary : theme.colors.text.secondary};
  position: relative;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
  
  ${props => props.$active && `
    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 3px;
      background-color: ${theme.colors.accent};
    }
  `}
  
  &:hover {
    color: ${theme.colors.text.primary};
    background-color: ${theme.colors.background.secondary};
  }
  
  @media (min-width: ${theme.breakpoints.tablet}) {
    padding: 16px 24px;
    font-size: 15px;
    flex: 1;
  }
`;

export default Tabs;

