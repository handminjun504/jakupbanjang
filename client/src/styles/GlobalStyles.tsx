import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  html {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
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
    touch-action: manipulation;
    overscroll-behavior: none;
  }

  #root {
    min-height: 100vh;
    min-height: 100dvh;
  }

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
    min-height: ${theme.touchTarget.minHeight};
    font-size: 16px;
    user-select: none;
    -webkit-user-select: none;
  }

  input, select, textarea {
    font-family: inherit;
    font-size: 16px;
    outline: none;
    min-height: ${theme.touchTarget.minHeight};
    border-radius: ${theme.borderRadius.small};
  }

  select {
    appearance: none;
    -webkit-appearance: none;
  }

  label {
    user-select: none;
    -webkit-user-select: none;
    font-weight: 500;
  }
`;

export default GlobalStyles;

