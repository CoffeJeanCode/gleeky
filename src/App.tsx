import CodeEditor from "./components/CodeEditor";
import CodeRunner from "./components/CodeRunner";

const App: React.FC = () => {
  return (
    <div className="App">
      <CodeEditor />
      <CodeRunner />
    </div>
  );
};

export default App;
