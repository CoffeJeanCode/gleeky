import { FC, useEffect } from 'react';
import { styled } from 'goober';
import Split from 'split.js';
import CodeEditor from './components/CodeEditor';
import CodeOutput from './components/CodeOutput';
import Tabs from './components/Tabs';
import ErrorBoundary from './components/ErrorBoundary';

const App: FC = () => {
  useEffect(() => {
    Split(['.editor', '.runner'], { snapOffset: 10, gutterSize: 2 });
  }, []);

  return (
    <ErrorBoundary>
      <Header>
        <Tabs />
      </Header>
      <WrapperApp className="split">
        <CodeEditor />
        <CodeOutput />
      </WrapperApp>
    </ErrorBoundary>
  );
};

const Header = styled('header')`
  background: #282c34;
  display: flex;
  align-items: center;
`;

const WrapperApp = styled('main')`
  min-height: 100vh;
  display: flex;
  flex-direction: row;
  background: rgb(30, 30, 30);
  color: white;
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
  overflow: hidden;
`;

export default App;
