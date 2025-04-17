export const getLimits = (): {
  timeoutMs: number;
  maxIterations: number;
  maxDepth: number;
  maxArraySize: number;
} => {
  const cpus = navigator.hardwareConcurrency || 2;
  return {
    timeoutMs: cpus > 4 ? 5000 : 3000,
    maxIterations: cpus > 4 ? 100_000 : 300_000,
    maxDepth: cpus > 4 ? 150 : 80,
    maxArraySize: cpus > 4 ? 2_000_000 : 1_000_000,
  };
}