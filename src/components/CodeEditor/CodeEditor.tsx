import { Editor } from '@monaco-editor/react';
import { useStore } from '../../store';

const CodeEditor: React.FC = () => {
  const { code, setCode } = useStore();

  const handleCodeChange = (newCode: string) => setCode(newCode)

  return (
    <Editor width="50vw" height="100vh" language='javascript' value={code} theme='vs-dark' onChange={(value) => handleCodeChange(value || "")} />
  );
};

export default CodeEditor;
