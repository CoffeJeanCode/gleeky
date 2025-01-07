import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.tsx';
import { setup } from 'goober';
//@ts-ignore
import { createGlobalStyles } from 'goober/global';
import { theme } from './styles/theme';

setup(React.createElement);

const GlobalStyles = createGlobalStyles`
  ${theme}
  
  html,
  body {
    margin: 0;
    overflow: hidden;
  }

  * {
    box-sizing: border-box;
  }

  .split {
    display: flex;
    flex-direction: row;
}

  .gutter {
      background-color:var(--accent);
      background-repeat: no-repeat;
      background-position: 50%;
  }

`;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalStyles />
    <App />
  </React.StrictMode>
);
