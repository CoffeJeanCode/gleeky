import { Context } from "@/libs/vm-browser";
import { getLimits } from "./getLimits";
import { createLoopGuard } from "./loopGuard";
import { createConsoleProxy } from "../proxy/console";

export const setupExecutionContext = (limits: ReturnType<typeof getLimits>, logs: any[]) => {
  const executionContext = new Context();
  const moduleCache = new Map<string, string>();

  const loopGuard = createLoopGuard(limits.maxIterations);
  const loopCheck = Function('iterationCount', `
    iterationCount++;
    if (iterationCount > ${limits.maxIterations}) {
      throw new Error('Iteration limit exceeded');
    }
    return true;
  `);

  let currentDepth = 0;
  let aborted = false;

  const abort = () => { aborted = true; };

  const depthCheck = (fn: any) => {
    if (aborted) throw new Error('Execution aborted');
    if (currentDepth >= limits.maxDepth) throw new Error('Call stack limit exceeded');
    currentDepth++;
    const result = fn();
    currentDepth--;
    return result;
  };

  const ArrayProxy = new Proxy(Array, {
    construct(target, args) {
      if (args[0] > limits.maxArraySize) {
        throw new Error(`Array size exceeds maximum limit of ${limits.maxArraySize}`);
      }
      return new target(...args);
    }
  });

  const consoleProxy = createConsoleProxy(logs);

  executionContext.addProperty('loopGuard', loopGuard);
  executionContext.addProperty('loopCheck', loopCheck);
  executionContext.addProperty('depthCheck', depthCheck);
  executionContext.addProperty('Array', ArrayProxy);
  executionContext.addProperty('console', consoleProxy);
  executionContext.addProperty('moduleCache', moduleCache);
  executionContext.addProperty('process', { env: { NODE_ENV: 'production' } });
  executionContext.addProperty('iterationCount', 0);

  return { executionContext, moduleCache, abort };
}
