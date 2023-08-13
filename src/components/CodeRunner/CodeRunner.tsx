import React, { useEffect } from 'react';
import { useStore } from '../../store';
import { styled } from 'goober';
import { Context, Script } from '../../libs/vm-browser';

const CodeRunner: React.FC = () => {
  const { code, output, isLoading, error, setIsLoading, setError, setOutput } =
    useStore();

  const codeLines = code.split('\n');
  const outputLines = output.map((line) => (line === 'undefined' ? '' : line));
  useEffect(() => {
    executeCode();
  }, [code]);

  const executeCode = async () => {
    setIsLoading(true);
    try {
      let cumulativeScript = '';
      let tempScript = '';
      let currentLine = 0;
      const outputs = [];

      const originalConsoleLog = console.log;

      const consoleLog = (...args: any[]) => {
        originalConsoleLog(...args);
        const logMessage = args
          .map((arg) => {
            if (typeof arg === 'object') {
              return JSON.stringify(arg, null, 2); // Convert objects to pretty JSON format
            }
            return arg;
          })
          .join(' ');

        outputs.push(logMessage);
      };

      for (let i = 0; i < codeLines.length; i++) {
        const line = codeLines[i];
        cumulativeScript += line;

        try {
          tempScript += line;
          const context = new Context();
          context.addProperty('log', consoleLog);
          const myScript = new Script(cumulativeScript);

          if (line.trim().endsWith(';')) {
            const run = myScript.runInContext(context);
            const result = String(run);

            console.log(result, code);
            outputs.push(result);

            tempScript = '';
            currentLine = i + 1;
          } else {
            tempScript += '\n';
          }
        } catch (innerError: any) {
          outputs.push(innerError.message);
        }
      }

      setOutput(outputs);
    } catch (error: any) {
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <WrapperCodeRunner>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        <div>
          {codeLines.map((_, index) => (
            <CodeLine key={index}>
              <LineNumber>{index + 1}</LineNumber>
              <OutputText>{outputLines[index] ?? ''}</OutputText>
            </CodeLine>
          ))}
        </div>
      )}
    </WrapperCodeRunner>
  );
};

const WrapperCodeRunner = styled('section')`
  width: 100vh;
  padding-top: 1rem;
  padding-bottom: 1rem;
  white-space: pre-wrap;
`;

const CodeLine = styled('div')`
  display: flex;
  align-items: center;
  padding-top: 0.5rem;
  margin-top: 0.5rem;
`;

const LineNumber = styled('span')`
  width: 30px;
  margin-right: 8px;
  color: #999;
  user-select: none;
`;

const OutputText = styled('code')`
  flex-grow: 1;
  color: #666;
`;

export default CodeRunner;
