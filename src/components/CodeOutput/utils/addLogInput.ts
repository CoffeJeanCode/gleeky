export const addAutoLog = (code: string) => {
  const skipPatterns = [
    // Especial keywords outside from log()
    /^\s*(const|let|var|function|class|if|else|for|while|do|switch|case|break|continue|return|throw|try|catch|finally|import|export|async|await|this|super|delete|typeof|instanceof|new|void|debugger|yield|default|in|of|as|with|console)/,
    // Free expressions 
    /^\s*.*\s*[=:{}\[\],]\s*/,
    // Elements in array or object
    /^\s+.+,?\s*$/,
    // Literal Regex 
    /^\s*\/.*\/[gimysu]*\s*$/,
    /^\s*\(.+\)\s*=>\s*.*$/,
    // Other patterns to skip
    /^\s*(\/\/|\/\*)/,  // Comments
    /^\s*$/,            // Avoid lines
    /^\s*log\(/,        // Within log()
    /^\s*</,            // Possible JSX
    /^\s*\}/,           // Block Closed
    /^\s*\)/,           // Brackets Closed
    /^\s*>$/,           // Possible Closed JSX
    /^\s*\]/,           // Cosed Array
  ];

  let inMultilineStructure = false;
  let bracketCount = 0;
  let parenCount = 0;
  let braceCount = 0;
  let inRegex = false;

  return code.split('\n').map(line => {
    // Count all braces and parenthesis
    const openBrackets = (line.match(/\[/g) || []).length;
    const closeBrackets = (line.match(/\]/g) || []).length;
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    const openBraces = (line.match(/\{/g) || []).length;
    const closeBraces = (line.match(/\}/g) || []).length;

    bracketCount += openBrackets - closeBrackets;
    parenCount += openParens - closeParens;
    braceCount += openBraces - closeBraces;

    const hasRegexStart = line.match(/[=:,(]\s*\//);
    const hasRegexEnd = line.match(/\/[gimysu]*\s*[),;]/);

    if (hasRegexStart && !hasRegexEnd) {
      inRegex = true;
    } else if (hasRegexEnd && inRegex) {
      inRegex = false;
    }

    if (bracketCount > 0 || parenCount > 0 || braceCount > 0 || inRegex) {
      inMultilineStructure = true;
    } else {
      inMultilineStructure = false;
    }

    if (inMultilineStructure) {
      return line;
    }

    const hasArrowFunction = line.includes('=>');
    const isCompleteRegex = line.match(/^\s*\/.*\/[gimysu]*\s*;?\s*$/);

    if (hasArrowFunction || isCompleteRegex) {
      const shouldSkip = skipPatterns.some(pattern => pattern.test(line));
      if (shouldSkip) {
        return line;
      }
    }

    const shouldSkip = skipPatterns.some(pattern => pattern.test(line));
    if (shouldSkip) {
      return line;
    }

    const trimmed = line.trim();

    if (trimmed === '' || trimmed === ';') {
      return line;
    }

    return line.replace(
      /^(\s*)(.*?)(\s*;?\s*)$/,
      (_, leadingSpace, content, trailingSpace) =>
        `${leadingSpace}log(${content.trim()})${trailingSpace.includes(';') ? ';' : ''}`
    );
  }).join('\n');
};
