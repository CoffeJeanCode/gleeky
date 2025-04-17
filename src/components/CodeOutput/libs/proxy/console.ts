import { Output, OutputType } from "@/models/code";
import { formatValue } from "../values";
import { createMarkdownTable } from "./table";

interface ConsoleProxy {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  table: (data: any) => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
}


export const createConsoleProxy = (logs: Output): ConsoleProxy => {
  const timers: Record<string, number> = {};

  const logEntry = (type: OutputType) => (...args: any[]) => {
    args.forEach((arg) => {
      logs.push({
        type,
        data: [formatValue(arg)]
      });
    });
  };

  return {
    log: logEntry('log'),
    error: logEntry('error'),
    warn: logEntry('warn'),

    table: (data: any) => {
      if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
        logs.push({
          type: 'error',
          data: [{ type: 'string', value: 'Invalid data for console.table' }]
        });
        return;
      }

      const markdownTable = createMarkdownTable(data);

      logs.push({
        type: 'table',
        data: [{
          type: 'number',
          value: markdownTable
        }]
      });
    },

    time: (label: string) => {
      timers[label] = Date.now();
    },

    timeEnd: (label: string) => {
      if (timers[label]) {
        const duration = Date.now() - timers[label];
        logs.push({
          type: 'log',
          data: [{ type: 'string', value: `${label}: ${duration}ms` }]
        });
        delete timers[label];
      } else {
        logs.push({
          type: 'error',
          data: [{ type: 'string', value: `Timer '${label}' does not exist` }]
        });
      }
    }
  };
};

