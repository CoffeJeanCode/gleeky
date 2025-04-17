import { Data, DataType } from "@/models/code";

type SafeStringifyOptions = {
  maxDepth?: number;
  maxLength?: number;
};

export const safeStringify = (
  value: unknown,
  options: SafeStringifyOptions = {}
): string => {
  const seen = new WeakSet();
  const maxDepth = options.maxDepth ?? 10;
  const maxLength = options.maxLength ?? 100_000;
  let totalLength = 0;
  let truncated = false;

  const truncate = (str: string): string => {
    totalLength += str.length;
    if (totalLength > maxLength) {
      truncated = true;
      const allowed = maxLength - (totalLength - str.length);
      return str.slice(0, allowed);
    }
    return str;
  };

  const serialize = (val: unknown, depth: number): any => {
    if (depth > maxDepth) return '[Max Depth Reached]';

    try {
      if (val === undefined) return 'undefined';
      if (val === null) return 'null';
      if (typeof val === 'string') return truncate(val);
      if (typeof val === 'number' || typeof val === 'boolean') return val;
      if (typeof val === 'bigint') return `${val.toString()}n`;
      if (typeof val === 'symbol') return val.toString();
      if (typeof val === 'function')
        return `[Function: ${(val as Function).name || 'anonymous'}]`;

      if (val instanceof Date) return val.toISOString();
      if (val instanceof RegExp) return val.toString();
      if (val instanceof Error) {
        return {
          name: val.name,
          message: truncate(val.message),
          stack: truncate(val.stack || '')
        };
      }

      if (typeof val === 'object') {
        if (seen.has(val)) return '[Circular]';
        seen.add(val);

        if (val instanceof Map) {
          return {
            [`[Map]`]: Array.from(val.entries()).map(([k, v]) => [
              serialize(k, depth + 1),
              serialize(v, depth + 1)
            ])
          };
        }

        if (val instanceof Set) {
          return {
            [`[Set]`]: Array.from(val.values()).map(v =>
              serialize(v, depth + 1)
            )
          };
        }

        const result: Record<string, any> = {};
        const isPlain = Object.prototype.toString.call(val) === '[object Object]';
        const className = val.constructor?.name ?? 'Object';

        for (const key of [
          ...Object.getOwnPropertyNames(val),
          ...Object.getOwnPropertySymbols(val)
        ]) {
          if (truncated) break;
          try {
            const desc = Object.getOwnPropertyDescriptor(val, key);
            if (!desc) continue;

            const keyStr = key.toString();
            if (desc.get || desc.set) {
              result[keyStr] = {
                get: desc.get ? '[Getter]' : undefined,
                set: desc.set ? '[Setter]' : undefined
              };
            } else {
              result[keyStr] = serialize((val as any)[key], depth + 1);
            }
          } catch {
            result[key.toString()] = '[Property inaccessible]';
          }
        }

        return isPlain ? result : { [`[${className}]`]: result };
      }

      return String(val);
    } catch {
      return '[Unable to serialize]';
    }
  };

  try {
    const output = JSON.stringify(serialize(value, 0), null, 2);
    return JSON.stringify(
      truncated
        ? { notice: '[Truncated]', partial: JSON.parse(output) }
        : JSON.parse(output),
      null,
      2
    );
  } catch {
    return '[Unable to stringify value]';
  }
};

export const getType = (value: any): DataType => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (value instanceof Map) return 'map';
  if (value instanceof Set) return 'set';
  if (value instanceof Date) return 'date';
  if (value instanceof RegExp) return 'regexp';
  if (value instanceof Error) return 'error';
  if (typeof value === 'function') return 'function';
  if (typeof value === 'object') {
    if (Object.prototype.toString.call(value) === '[object Object]') return 'object';
    return 'class';
  }
  return typeof value as DataType;
};

export const formatValue = (value: any): Data => {
  const type = getType(value);
  return {
    type,
    value: safeStringify(value, { maxLength: 5000 })
  };
};