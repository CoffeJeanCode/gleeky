import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.tsx';
import { setup } from 'goober';
//@ts-ignore
import { createGlobalStyles } from 'goober/global';

setup(React.createElement);

const GlobalStyles = createGlobalStyles`
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
      background-color:rgb(40, 194, 255);
      background-repeat: no-repeat;
      background-position: 50%;
  }

  .gutter.gutter-horizontal {
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
      cursor: col-resize;
  }
`;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GlobalStyles />
    <App />
  </React.StrictMode>
);
