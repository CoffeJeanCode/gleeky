// Utility function to preload a module
export const preloadModule = async (
  moduleName: string,
  moduleCache: Map<string, string>,
  version: string = 'latest'
) => {
  const buildUrl = (cdn: 'unpkg' | 'jsdelivr') => {
    const base = cdn === 'unpkg'
      ? 'https://unpkg.com/'
      : 'https://cdn.jsdelivr.net/npm/';
    return `${base}${moduleName}${version === 'latest' ? '' : '@' + version}`;
  };

  const tryFetch = async (cdn: 'unpkg' | 'jsdelivr') => {
    const url = buildUrl(cdn);
    if (moduleCache.has(url)) return moduleCache.get(url)!;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Error loading from ${cdn}: ${response.statusText}`);

    const content = await response.text();
    moduleCache.set(url, content);
    return content;
  };

  try {
    return await tryFetch('unpkg');
  } catch (unpkgError) {
    try {
      return await tryFetch('jsdelivr');
    } catch (jsDelivrError: any) {
      throw new Error(`Failed to load module '${moduleName}' from both CDNs.\nUnpkg error: ${unpkgError}\nJsDelivr error: ${jsDelivrError.message}`);
    }
  }
};

// Utility function to extract module names
export const extractModuleNames = (code: string): string[] => {
  const moduleRegex = /require\(['"]([^'\"]+)['"]\)/g;
  return [...code.matchAll(moduleRegex)].map(match => match[1]);
};
