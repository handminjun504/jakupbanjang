// 작업반장 디자인 시스템 테마

export const theme = {
  colors: {
    // 배경색
    background: {
      primary: '#FFFFFF',
      secondary: '#F1F3F5',
    },
    
    // 텍스트
    text: {
      primary: '#212529',
      secondary: '#868E96',
    },
    
    // 강조색 (주요 버튼, 활성 탭 등)
    accent: '#FFD644',
    
    // 테두리/구분선
    border: '#DEE2E6',
    
    // 버튼
    button: {
      primary: '#FFD644',
      secondary: '#F1F3F5',
    },
    
    // 추가 색상 (호환성을 위해)
    primary: '#007BFF',
    secondary: '#6C757D',
    primaryDark: '#0056b3',
    textSecondary: '#868E96',
    error: '#DC3545',
  },
  
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", "Segoe UI", "Roboto", sans-serif',
    
    pageTitle: {
      fontSize: '20px',
      fontWeight: '700',
    },
    
    sectionTitle: {
      fontSize: '16px',
      fontWeight: '700',
    },
    
    body: {
      fontSize: '14px',
      fontWeight: '400',
    },
  },
  
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    round: '24px',
  },
  
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  
  // 반응형 분기점 (Breakpoints)
  breakpoints: {
    mobile: '768px',  // 768px 미만은 모바일
    tablet: '768px',  // 768px 이상은 태블릿/PC
    desktop: '1024px', // 1024px 이상은 데스크톱
  },
  
  // PC 환경 최대 너비
  maxWidth: {
    content: '1200px',
    form: '480px',
  },
};

export type Theme = typeof theme;

