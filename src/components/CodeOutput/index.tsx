import React, { useEffect, useMemo } from 'react';
import { styled } from 'goober';
import OutputLines from '../OutputLines';
import { useCodeStore } from '@/store/code';
import { Context, Script } from '@/libs/vm-browser';
import { createConsoleProxy } from './utils/createConsoleProxy';
import { extractModuleNames, preloadModule } from './utils/createModuleProxy';
import { createUtilFunctions } from './utils/createUtilFunctions';


const CodeOutput: React.FC = () => {
  const { code, output, setOutput } = useCodeStore();

  const executeCode = useMemo(() => {
    return async () => {
      const { output: logs, proxy } = createConsoleProxy();
      const moduleCache = new Map<string, string>();
      const executionContext = new Context();

      executionContext.addProperty('console', proxy);
      executionContext.addProperty('moduleCache', moduleCache);

      try {
        const moduleNames = extractModuleNames(code);

        await Promise.all(moduleNames.map(name => preloadModule(name, moduleCache)));

        const userCodeWrapper = `
          globalThis.process = { env: { NODE_ENV: 'production' } };
          ${createUtilFunctions()}
          ${code}
        `;

        const executionScript = new Script(userCodeWrapper);

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


const WrapperCodeRunner = styled('section')`
  width: 100vw;
  height: calc(100vh - 35px);
  padding: 0 1rem 1rem 2rem;
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
