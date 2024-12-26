import { Editor } from '@monaco-editor/react';
import { FC } from 'react';
import DarkPlus from "./dark-plus.json";
import { useCodeStore } from '@/store/code';

function setEditorTheme(monaco: any) {
  monaco.editor.defineTheme('onedark', {
    base: 'vs-dark',
    inherit: true,
    ...DarkPlus
  });

}

const CodeEditor: FC = () => {
  const { code, setCode } = useCodeStore();

  const handleCodeChange = (rawCode: string | undefined) => setCode(rawCode ?? "");

  return (
    <div className="editor">
      <Editor
        language="javascript"
        options={{
          minimap: { enabled: false },
          lineNumbers: 'on',
          fontSize: 18,
          tabSize: 2,
          padding: { top: 16, bottom: 16 },
          wordWrap: 'off',
          formatOnPaste: true,
          formatOnType: true,
          bracketPairColorization: {
            enabled: true
          }
        }}
        value={code}
        theme={"onedark"}
        beforeMount={setEditorTheme}
        onChange={handleCodeChange}
      />
    </div>
  );
};


export default CodeEditor;
