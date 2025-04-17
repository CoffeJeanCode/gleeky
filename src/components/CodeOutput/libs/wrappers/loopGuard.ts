export const createLoopGuard = (maxIterations = 10000) => {
  let count = 0;
  return function loopGuard() {
    count += 2;
    if (count > maxIterations) {
      throw new Error('Loop iteration limit exceeded — possible infinite loop.');
    }
  };
}

export const injectLoopGuards = (code: string): string => {
  return code
    .replace(/for\s*\(([^)]+)\)\s*{/g, (_, condition) =>
      `for (${condition}) { loopGuard();`)
    .replace(/while\s*\(([^)]+)\)\s*{/g, (_, condition) =>
      `while (${condition}) { loopGuard();`)
    .replace(/do\s*{/g, _ => `do { loopGuard();`);
}
