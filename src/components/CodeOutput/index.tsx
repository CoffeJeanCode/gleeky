import React, { useEffect, useMemo } from 'react';
import { styled } from 'goober';
import OutputLines from '../OutputLines';
import { useCodeStore } from '@/store/code';
import { Context, Script } from '@/libs/vm-browser';
import { createConsoleProxy } from './utils/createConsoleProxy';


const CodeOutput: React.FC = () => {
  const { code, output, setOutput } = useCodeStore();

  const executeCode = useMemo(() => {
    return () => {
      const { output: logs, proxy } = createConsoleProxy();
      try {

        const executionContext = new Context();
        executionContext.addProperty("console", proxy);

        const utilFunctions = `
        function log(...x) {
          console.log(...x);
          return [...x];
          };
          `

        const executionScript = new Script(`
          ${utilFunctions}
          ;(() => {
          ${code} 
          // Runnig the code
          })();
          `);


        executionScript.runInContext(executionContext);
      } catch (err: any) {
        console.error(err)
        logs.push({
          type: 'error',
          data: [{ value: err.toString(), type: 'string' }],
        });
      }

      setOutput(logs);
    };
  }, [code]);


  useEffect(() => {
    const timeoutId = setTimeout(() => {
      executeCode();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [code]);

  return (
    <WrapperCodeRunner className='runner'>
      {
        output.map((log, index) => (
          <LineWrapper key={index}>
            <LineNumber>
              {index + 1}
            </LineNumber>
            <OutputLines log={log} />
          </LineWrapper>
        ))
      }
    </WrapperCodeRunner>
  );
};

const LineWrapper = styled("div")`
  display: flex;
  align-items: flex-start;
  margin-top: 5px;
  margin-bottom: 5px;
`;

const LineNumber = styled("span")`
  color: #9ca3af;
  margin-right: 0.5rem;
  font-weight: bold;
  user-select: none;
`;

const WrapperCodeRunner = styled('section')`
  width: 100vw;
  height: 100vh;
  padding: 1rem;
  white-space: pre-wrap;
  background-color: #282c34;
  overflow-y: scroll;
  &::-webkit-scrollbar { width: 14px;}
  &::-webkit-scrollbar-track { background: transparent; width: 14px; border-left: 1px solid #404349; } 
  &::-webkit-scrollbar-thumb { background-color: rgba(121, 121, 121, 0.4);  } 
  &::-webkit-scrollbar-thumb:hover { background-color: rgba(121, 121, 121, 0.5); }
  &::-webkit-scrollbar-thumb:active { background-color: rgba(121, 121, 121, 0.6); }
  `;

export default CodeOutput;
