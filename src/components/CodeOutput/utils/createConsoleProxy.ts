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
    if (value === undefined) return 'undefined';
    if (value === null) return 'null';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    if (typeof value === 'function') return `[Function: ${value.name || 'anonymous'}]`;
    if (typeof value === 'symbol') return value.toString();
    if (typeof value === 'bigint') return `${value.toString()}n`;
    if (typeof value === 'object') {
      const seen = new WeakSet();

      // Handle special cases
      if (value instanceof Date) return value.toISOString();
      if (value instanceof RegExp) return value.toString();
      if (value instanceof Error) {
        return JSON.stringify({
          name: value.name,
          message: value.message,
          stack: value.stack
        }, null, 2);
      }

      // Check if the value is an instance of a class
      if (value.constructor && value.constructor.name !== 'Object') {
        const className = value.constructor.name;
        // Get all properties including non-enumerable ones and symbols
        const properties = [
          ...Object.getOwnPropertyNames(value),
          ...Object.getOwnPropertySymbols(value).map(sym => sym.toString())
        ];

        // Create object representation with property descriptors
        const objRepresentation = properties.reduce((acc, prop) => {
          const descriptor = Object.getOwnPropertyDescriptor(value, prop);
          if (descriptor) {
            // Handle getters and setters
            if (descriptor.get || descriptor.set) {
              acc[prop] = {
                get: descriptor.get ? '[Getter]' : undefined,
                set: descriptor.set ? '[Setter]' : undefined
              };
            } else {
              acc[prop] = value[prop];
            }
          }
          return acc;
        }, {} as Record<string, any>);

        return JSON.stringify({
          [`[${className}]`]: objRepresentation
        }, (_, val) => {
          if (typeof val === 'object' && val !== null) {
            if (seen.has(val)) return '[Circular]';
            seen.add(val);

            // Handle nested class instances
            if (val.constructor && val.constructor.name !== 'Object') {
              const nestedClassName = val.constructor.name;
              const nestedProps = Object.getOwnPropertyNames(val).reduce((acc, prop) => {
                acc[prop] = val[prop];
                return acc;
              }, {} as Record<string, any>);
              return { [`[${nestedClassName}]`]: nestedProps };
            }
          }

          if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
          if (val instanceof Date) return val.toISOString();
          if (val instanceof RegExp) return val.toString();

          try {
            return val;
          } catch {
            return '[Complex Value]';
          }
        }, 2);
      }

      // Handle regular objects
      return JSON.stringify(value, (_, val) => {
        if (typeof val === 'object' && val !== null) {
          if (seen.has(val)) return '[Circular]';
          seen.add(val);
        }

        if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
        if (val instanceof Date) return val.toISOString();
        if (val instanceof RegExp) return val.toString();

        try {
          return val;
        } catch {
          return '[Complex Value]';
        }
      }, 2);
    }
    return JSON.stringify(value);
  } catch (error) {
    return '[Unable to stringify value]';
  }
};

const getType = (value: any): DataType => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Error) return 'error';
  return typeof value;
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
    args.forEach((arg) => {
      output.push({
        type,
        data: [formatValue(arg)]
      });
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
