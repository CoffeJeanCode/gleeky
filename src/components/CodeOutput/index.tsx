import React, { useEffect, useMemo } from 'react';
import { styled } from 'goober';
import OutputLines from '../OutputLines';
import { useCodeStore } from '@/store/code';
import { Script } from '@/libs/vm-browser';
import { extractModuleNames, preloadModule } from './libs/proxy/module';
import { getLimits } from './libs/wrappers/getLimits';
import { prepareUserCode } from './libs/wrappers/prepareCode';
import { setupExecutionContext } from './libs/wrappers/setupExecution';
import { runUserCodeWithTimeout } from './libs/wrappers/runCodeTimeout';


const CodeOutput: React.FC = () => {
  const { code, output, setOutput } = useCodeStore();

  const executeCode = useMemo(() => {
    return async () => {
      const logs: any[] = [];
      const limits = getLimits();
      const { executionContext, moduleCache, abort } = setupExecutionContext(limits, logs);

      const preparedCode = prepareUserCode(code);
      const moduleNames = extractModuleNames(code);

      try {
        await Promise.all(moduleNames.map(name => preloadModule(name, moduleCache)));

        const script = new Script(preparedCode);
        await runUserCodeWithTimeout(script, executionContext, limits.timeoutMs, abort);
      } catch (err: any) {
        logs.push({
          type: 'error',
          data: [{ value: err.toString(), type: 'string' }]
        });
      }

      setOutput(logs);
    };
  }, [code]);


  useEffect(() => {
    const timeoutId = setTimeout(() => {
      executeCode();
    }, 500);

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
        font-family: var(--font-family);
        background-color: var(--bg);
        overflow-y: scroll;
        &::-webkit-scrollbar {width: 14px;}
        &::-webkit-scrollbar-track {background: transparent; width: 14px; border-left: 1px solid #404349; }
        &::-webkit-scrollbar-thumb {background - color: rgba(121, 121, 121, 0.4);  }
        &::-webkit-scrollbar-thumb:hover {background - color: rgba(121, 121, 121, 0.5); }
        &::-webkit-scrollbar-thumb:active {background - color: rgba(121, 121, 121, 0.6); }
        `;

export default CodeOutput;
