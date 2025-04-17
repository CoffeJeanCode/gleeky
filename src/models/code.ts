export type Code = string;
export type DataType =
  | 'undefined'
  | 'null'
  | 'boolean'
  | 'number'
  | 'bigint'
  | 'string'
  | 'symbol'
  | 'function'
  | 'array'
  | 'object'
  | 'map'
  | 'set'
  | 'date'
  | 'regexp'
  | 'error'
  | 'class'
  | 'circular'
  | 'unknown';
export type OutputType = "error" | "log" | "warn" | "table";

export interface Data { type: DataType, value: string }
export interface OutputLine { type: OutputType, data: Data[] };
export type Output = OutputLine[];