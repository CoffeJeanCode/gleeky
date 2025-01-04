import { Data, DataType, Output, OutputType } from "@/models/code";

interface ConsoleProxy {
  log: (...args: any[]) => void;
  error: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  table: (data: any) => void;
  time: (label: string) => void;
  timeEnd: (label: string) => void;
}

interface ProxyReturn {
  proxy: ConsoleProxy;
  output: Output;
}


const safeStringify = (value: any): string => {
  try {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'function') return value.toString();
    if (typeof value === 'symbol') return value.toString();
    if (typeof value === 'bigint') return value.toString();
    return JSON.stringify(value);
  } catch (error) {
    return '[Unable to stringify value]';
  }
};

const getType = (value: any): DataType => {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  return typeof value as DataType;
};

const formatValue = (value: any): Data => ({
  type: getType(value),
  value: safeStringify(value)
});

const createMarkdownTable = (data: any[]): string => {
  if (data.length === 0) return '';

  const headers = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));

  const columnWidths = headers.map(header => {
    return Math.max(
      header.length,
      ...data.map(row => {
        const value = safeStringify(row[header] ?? '').replace(/\n/g, ' ');
        return value.length;
      })
    );
  });

  const formatRow = (row: any[]) =>
    `| ${row.map((cell, i) => cell.padEnd(columnWidths[i], ' ')).join(' | ')} |`;

  const headerRow = formatRow(headers);

  const separatorRow = `| ${columnWidths.map(width => '-'.repeat(width)).join(' | ')} |`;

  const dataRows = data.map(obj =>
    formatRow(
      headers.map(header => {
        const value = safeStringify(obj[header] ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
        return value;
      })
    )
  );

  return [headerRow, separatorRow, ...dataRows].join('\n');
};


export const createConsoleProxy = (): ProxyReturn => {
  const output: Output = [];
  const timers: Record<string, number> = {};

  const logEntry = (type: OutputType) => (...args: any[]) => {
    output.push({
      type,
      data: args.map(formatValue)
    });
  };

  const proxy: ConsoleProxy = {
    log: logEntry('log'),
    error: logEntry('error'),
    warn: logEntry('warn'),

    table: (data: any) => {
      if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
        output.push({
          type: 'error',
          data: [{ type: 'string', value: 'Invalid data for console.table' }]
        });
        return;
      }

      const tableData = Array.isArray(data) ? data : [data];

      if (tableData.length === 0) {
        output.push({
          type: 'table',
          data: [{ type: 'string', value: '*Empty table*' }]
        });
        return;
      }

      const markdownTable = createMarkdownTable(tableData);

      output.push({
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
        output.push({
          type: 'log',
          data: [{ type: 'string', value: `${label}: ${duration}ms` }]
        });
        delete timers[label];
      } else {
        output.push({
          type: 'error',
          data: [{ type: 'string', value: `Timer '${label}' does not exist` }]
        });
      }
    }
  };

  return { proxy, output };
};
