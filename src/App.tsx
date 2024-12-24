import { FC, useEffect } from 'react';
import { styled } from 'goober';
import Split from 'split.js';
import CodeEditor from './components/CodeEditor';
import CodeOutput from './components/CodeOutput';

const App: FC = () => {
  useEffect(() => {
    Split(['.editor', '.runner'], { snapOffset: 10, gutterSize: 2 });

    document.addEventListener('keydown', (e) => {
      if (e.key === 's' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const event = new Event('save');
        document.dispatchEvent(event);
      }
    });

  }, []);

  return (
    <WrapperApp className="split">
      <CodeEditor />
      <CodeOutput />
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
