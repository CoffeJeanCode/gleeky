export type Code = string;

export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'undefined' | 'function' | 'symbol' | 'bigint' | "null";
export type OutputType = "error" | "log" | "warn";

export type Data = { type: DataType, value: string }
export type OutputLine = { type: OutputType, data: Data[] };
export type Output = OutputLine[];