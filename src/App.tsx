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
  background: var(--bg);
  display: flex;
  align-items: center;
`;

const WrapperApp = styled('main')`
  min-height: 100vh;
  display: flex;
  flex-direction: row;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font-family);
  font-size: var(--font-size);
  overflow: hidden;
`;

export default App;
