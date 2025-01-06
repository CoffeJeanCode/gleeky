// Utility function to preload a module
export const preloadModule = async (
  moduleName: string,
  moduleCache: Map<string, string>,
  version: string = 'latest'
) => {
  const url = `https://unpkg.com/${moduleName}${version === 'latest' ? '' : '@' + version}`;
  if (moduleCache.has(url)) return moduleCache.get(url)!;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Error loading module: ${response.statusText}`);
    }
    const content = await response.text();
    moduleCache.set(url, content);
    return content;
  } catch (error: any) {
    throw new Error(`Failed to load ${url}: ${error.message}`);
  }
};

// Utility function to extract module names
export const extractModuleNames = (code: string): string[] => {
  const moduleRegex = /require\(['"]([^'\"]+)['"]\)/g;
  return [...code.matchAll(moduleRegex)].map(match => match[1]);
};
