import { FC } from "react"
import CodeEditor from "./components/CodeEditor";
import CodeRunner from "./components/CodeRunner";
import { styled } from "goober";

const App: FC = () => {
  return (
    <WrapperApp>
      <CodeEditor />
      <CodeRunner />
    </WrapperApp>
  );
};

const WrapperApp = styled("main")`
  min-height: 100vh; 
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgb(30, 30, 30);
  color: white;
  font-family: 'Courier New', Courier, monospace;
  font-size: 18px;
  overflow: hidden;
`

export default App;
