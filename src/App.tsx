import { FC, useEffect } from 'react';
import { styled } from 'goober';
import Split from 'split.js';
import CodeEditor from './components/CodeEditor';
import CodeOutput from './components/CodeOutput';
import Tabs from './components/Tabs';

const App: FC = () => {
  useEffect(() => {
    Split(['.editor', '.runner'], { snapOffset: 10, gutterSize: 2 });
  }, []);

  return (
    <>
      <Tabs />
      <WrapperApp className="split">
        <CodeEditor />
        <CodeOutput />
      </WrapperApp>
    </>
  );
};

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
