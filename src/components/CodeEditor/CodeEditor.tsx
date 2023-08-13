import { Editor } from '@monaco-editor/react';
import { useStore } from '../../store';
import { FC } from 'react';
import { styled } from 'goober';

const CodeEditor: FC = () => {
  const { code, setCode } = useStore();

  const handleCodeChange = (newCode: string) => setCode(newCode);

  return (
    <EditorWrapper>
      <Editor
        language="javascript"
        options={{
          lineNumbers: 'on',
          fontSize: 18,
          padding: { top: 16, bottom: 16 },
        }}
        value={code}
        theme="vs-dark"
        onChange={(value) => handleCodeChange(value ?? '')}
      />
    </EditorWrapper>
  );
};

const EditorWrapper = styled('section')`
  grid-column: 1;
  padding-top: 1rem;
  padding-bottom: 1rem;
`;

export default CodeEditor;
