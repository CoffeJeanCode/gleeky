import { FC, useEffect } from 'react';
import CodeEditor from './components/CodeEditor';
import CodeRunner from './components/CodeRunner';
import { styled } from 'goober';
import Split from 'split.js';

const App: FC = () => {
  useEffect(() => {
    Split(['.editor', '.runner']);
  }, []);

  return (
    <WrapperApp className="split">
      <CodeEditor />
      <CodeRunner />
    </WrapperApp>
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
