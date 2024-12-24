import React, { useEffect, useMemo } from 'react';
import { useStore } from '../../store';
import { styled } from 'goober';
import { Context, Script } from '../../libs/vm-browser';
import OutputLines from './OutputLines';
import { OutputType } from '../../types/code';

const createConsoleProxy = () => {
  const logs: OutputType[] = [];
  const proxy = {
    log: (...args: any[]) => {
      logs.push({
        type: 'log',
        data: args,
      });
    },
    error: (...args: any[]) => {
      logs.push({
        type: 'error',
        data: args,
      });
    },
    warn: (...args: any[]) => {
      logs.push({
        type: 'warning',
        data: args,
      });
    },
  };
  return { logs, proxy };
};

const CodeRunner: React.FC = () => {
  const { code, output, isLoading, error, setOutput } = useStore();

  const executeCode = useMemo(() => {
    return () => {

      const { logs, proxy } = createConsoleProxy();
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
        ;(() => {${code}})();
        `);

        executionScript.runInContext(executionContext);

      } catch (err) {
        console.error(err)
        logs.push({
          type: 'error',
          data: [err],
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
      setOutput([]);
    };
  }, [code]);

  return (
    <WrapperCodeRunner className='runner'>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <div>Error: {error.message}</div>
      ) : (
        output.map((log, index) => (
          <OutputLines key={index} log={log} />
        ))
      )}
    </WrapperCodeRunner>
  );
};



const WrapperCodeRunner = styled('section')`
      width: 100vw;
      height: 100vh;
      padding-top: 1rem;
      padding-bottom: 1rem;
      white-space: pre-wrap;
      overflow-y: scroll;
      &::-webkit-scrollbar { width: 12px; }
      &::-webkit-scrollbar-track { background: #2c2c2c; border-radius: 6px; } 
      &::-webkit-scrollbar-thumb { background-color: #666; border-radius: 6px; border: 3px solid #2c2c2c; } 
      &::-webkit-scrollbar-thumb:hover { background-color: #888; }
      &::-webkit-scrollbar-thumb:active { background-color: #aaa; }
      `;


export default CodeRunner;
