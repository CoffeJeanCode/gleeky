import { Context, Script } from "@/libs/vm-browser";

export const runUserCodeWithTimeout = async (
  script: Script,
  context: Context,
  timeoutMs: number,
  abort: () => void
) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => {
      abort();
      reject(new Error('Execution timeout'));
    }, timeoutMs)
  );

  return Promise.race([
    Promise.resolve(script.runInContext(context)),
    timeoutPromise
  ]);
}
