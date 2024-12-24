import { Output, OutputType } from "@/models/code";

export const createConsoleProxy = () => {
  const logs: Output = [];

  const proxyFunction = (type: OutputType) => (...args: any[]) => {
    logs.push({
      type,
      data: args.map((arg) => {
        if (arg === null) {
          return { value: "null", type: "null" };
        }
        if (arg === undefined) {
          return { value: "undefined", type: "undefined" };
        }
        if (Array.isArray(arg)) {
          return { value: JSON.stringify(arg), type: "array" };
        }
        if (typeof arg === "object") {
          return { value: JSON.stringify(arg), type: "object" };
        }
        return { value: arg.toString(), type: typeof arg };
      }),
    });
  };


  const proxy = {
    log: proxyFunction('log'),
    error: proxyFunction('error'),
    warn: proxyFunction('warn'),
  };

  return { logs, proxy };
};
