export const createUtilFunctions = () => `
  function log(...x) {
    console.log(...x);
    return [...x];
  }

  const loadedModules = {};
        
  function require(moduleName, version = 'latest') {
    const url = \`https://unpkg.com/\${moduleName}\${version === 'latest' ? '' : '@' + version}\`;
    
    if (loadedModules[url]) {
      return loadedModules[url].exports;
    }

    const moduleContent = moduleCache.get(url);
    if (!moduleContent) {
      throw new Error(\`Module \${moduleName} not found. Make sure to use a valid module name.\`);
    }
    
    const module = {
      exports: {}
    };

    loadedModules[url] = module;

    const wrappedContent = \`
      (function(module, exports, require, console) {
        \${moduleContent}
      })
    \`;

    const moduleFunction = eval(wrappedContent);
    moduleFunction(module, module.exports, require, console);
    
    return module.exports;
  }
    `;