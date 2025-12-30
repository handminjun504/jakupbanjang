import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: ${theme.typography.fontFamily};
    background-color: ${theme.colors.background.primary};
    color: ${theme.colors.text.primary};
    font-size: ${theme.typography.body.fontSize};
    font-weight: ${theme.typography.body.fontWeight};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    
    /* PC 환경에서 폰트 크기 증가 */
    @media (min-width: ${theme.breakpoints.tablet}) {
      font-size: 16px;
    }
  }

  #root {
    min-height: 100vh;
  }
  
  /* PC 환경에서 콘텐츠 최대 너비 제한 및 중앙 정렬 */
  @media (min-width: ${theme.breakpoints.tablet}) {
    .page-container {
      max-width: ${theme.maxWidth.content};
      margin: 0 auto;
    }
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    outline: none;
  }
`;

export default GlobalStyles;

