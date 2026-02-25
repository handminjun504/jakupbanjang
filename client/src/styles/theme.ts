// 작업반장 디자인 시스템 테마

export const theme = {
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F1F3F5',
    },
    text: {
      primary: '#212529',
      secondary: '#868E96',
    },
    accent: '#FFD644',
    border: '#DEE2E6',
    button: {
      primary: '#FFD644',
      secondary: '#F1F3F5',
    },
    primary: '#007BFF',
    secondary: '#6C757D',
    primaryDark: '#0056b3',
    textSecondary: '#868E96',
    error: '#DC3545',
  },

  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Pretendard", "Noto Sans KR", "Segoe UI", "Roboto", sans-serif',
    pageTitle: {
      fontSize: '24px',
      fontWeight: '700',
    },
    sectionTitle: {
      fontSize: '18px',
      fontWeight: '700',
    },
    body: {
      fontSize: '16px',
      fontWeight: '400',
    },
  },

  borderRadius: {
    small: '6px',
    medium: '10px',
    large: '14px',
    round: '24px',
  },

  spacing: {
    xs: '6px',
    sm: '10px',
    md: '16px',
    lg: '24px',
    xl: '36px',
  },

  breakpoints: {
    mobile: '768px',
    tablet: '768px',
    desktop: '1024px',
  },

  maxWidth: {
    content: '1200px',
    form: '480px',
  },

  touchTarget: {
    minHeight: '48px',
  },
};

export type Theme = typeof theme;

