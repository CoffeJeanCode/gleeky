// Función auxiliar para detectar si una línea contiene estructuras de datos complejas
const containsComplexStructures = (line: string) => {
  const trimmed = line.trim();
  // Buscamos arrays, objetos o estructuras que no sean asignaciones
  return (
    (trimmed.includes('{') && trimmed.includes('}') && !trimmed.includes('=')) ||
    (trimmed.includes('[') && trimmed.includes(']') && !trimmed.includes('=')) ||
    (trimmed.match(/^\s*\{.*\}\s*$/) !== null) ||
    (trimmed.match(/^\s*\[.*\]\s*$/) !== null)
  );
};

const processExpression = (expr: string) => {
  // Patrones para identificar expresiones que no deben modificarse
  const skipPatterns = [
    // Keywords que no deben ser envueltas en log()
    /^\s*(const|let|var|function|class|if|else|for|while|do|switch|case|break|continue|return|throw|try|catch|finally|import|export|async|await|this|super|delete|typeof|instanceof|new|void|debugger|yield|default|in|of|as|with|console)/,
    // Declaraciones y asignaciones
    /^\s*.*\s*=\s*/,
    /^\s*.*\s*:\s*/,
    // Otros patrones que no deben modificarse
    /^\s*(\/\/|\/\*)/,  // Comentarios
    /^\s*$/,            // Expresiones vacías
    /^\s*log\(/,        // Ya tiene log()
    /^\s*</,            // Posible JSX
    /^\s*\}/,           // Cierre de bloque
    /^\s*\)/,           // Cierre de paréntesis
    /^\s*>$/,           // Posible JSX cerrando
    /^\s*\]/,           // Cierre de arreglo
    /^\s*;$/,           // Solo un punto y coma
  ];

  // Patrones para identificar expresiones que sí deben tener log explícitamente
  const logPatterns = [
    // Llamadas a métodos con posible encadenamiento
    /^\s*[\w\.]+\([^)]*\)\s*$/,
    // Expresiones regulares literales
    /^\s*\/[^/\s][^/]*\/[gimsuy]*\s*$/,
    // Strings que contienen patrones regex
    /^\s*['"`]\/.*\/['"`]\s*$/,
    // Arrays literales
    /^\s*\[.*\]\s*$/,
    // Objetos literales
    /^\s*\{[^=:]*\}\s*$/,
    // Array/Object acceso con índice o propiedad (obj['prop'], arr[0])
    /^\s*[\w\.]+(\[.*\])+\s*$/,
  ];

  // Comprobamos si la expresión debe omitirse según nuestros patrones
  const shouldSkip = skipPatterns.some(pattern => pattern.test(expr));
  if (shouldSkip) {
    return expr;
  }

  const trimmed = expr.trim();

  // No agregar log() si no hay nada que loguear
  if (trimmed === '') {
    return expr;
  }

  // Comprobamos si la expresión debe tener log según nuestros patrones explícitos
  const shouldLog = logPatterns.some(pattern => pattern.test(trimmed));

  // No agregar log si no coincide con los patrones de log y no es un valor simple
  if (!shouldLog && !isSimpleValue(trimmed)) {
    return expr;
  }

  // Extraer punto y coma final si existe
  const hasSemicolon = trimmed.endsWith(';');
  let contentToLog = trimmed;

  if (hasSemicolon) {
    contentToLog = trimmed.slice(0, -1);
  }

  // Construir la expresión con log()
  let result = expr.replace(
    trimmed,
    `log(${contentToLog.trim()})`
  );

  // Agregar punto y coma al final si la expresión original lo tenía
  if (hasSemicolon && !result.endsWith(';')) {
    result += ';';
  }

  return result;
};

// Función para verificar si algo es un valor simple que debería tener log
const isSimpleValue = (str: string) => {
  // Valores simples que deberían tener log
  const simplePatterns = [
    /^\s*\d+(\.\d+)?\s*$/,          // Números
    /^\s*['"`].*['"`]\s*$/,         // Strings
    /^\s*true|false\s*$/,           // Booleanos
    /^\s*null|undefined\s*$/,       // Null/undefined
    /^\s*\/.*\/[gimsuy]*\s*$/,      // Regex literal
    /^\s*\[\s*\]\s*$/,              // Array vacío
    /^\s*\{\s*\}\s*$/,              // Objeto vacío
    /^\s*\w+\s*$/,                  // Identificadores simples
  ];

  return simplePatterns.some(pattern => pattern.test(str));
};

export const addAutoLog = (code: string) => {
  // Función auxiliar para procesar una sola expresión

  // Analiza el código línea por línea
  return code.split('\n').map(line => {
    // Ignorar líneas vacías
    if (line.trim() === '') return line;

    // Si la línea no contiene punto y coma ni símbolos de estructura de datos, la procesamos directamente
    if (!line.includes(';') && !containsComplexStructures(line)) {
      return processExpression(line);
    }

    // Para líneas con punto y coma o estructuras complejas, las dividimos en expresiones
    let expressions = [];
    let currentExpr = '';
    let inString = false;
    let stringChar = '';
    let inRegex = false;
    let inComment = false;
    let commentType = '';
    let escaped = false;
    let parenLevel = 0;
    let braceLevel = 0;
    let bracketLevel = 0;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = i < line.length - 1 ? line[i + 1] : '';

      // Detectar inicio/fin de comentarios
      if (!inString && !inRegex && !inComment) {
        if (char === '/' && nextChar === '/') {
          inComment = true;
          commentType = '//';
          currentExpr += char;
          continue;
        }
        if (char === '/' && nextChar === '*') {
          inComment = true;
          commentType = '/*';
          currentExpr += char;
          continue;
        }
      }

      // Detectar fin de comentarios
      if (inComment) {
        currentExpr += char;
        if (commentType === '//' && char === '\n') {
          inComment = false;
        } else if (commentType === '/*' && char === '*' && nextChar === '/') {
          // Consumir el siguiente carácter también
          currentExpr += nextChar;
          i++;
          inComment = false;
        }
        continue;
      }

      // Manejar caracteres escapados dentro de strings
      if (inString && char === '\\' && !escaped) {
        escaped = true;
        currentExpr += char;
        continue;
      }

      // Manejar inicio/fin de strings
      if ((char === '"' || char === "'" || char === '`') && !escaped && !inRegex) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
        }
        currentExpr += char;
        continue;
      }

      // Manejar inicio/fin de regex
      if (char === '/' && !inString && !escaped && !inComment) {
        // Detectar si es el inicio de un regex
        const prevNonWhitespace = currentExpr.replace(/\s+$/, '').slice(-1);
        const isStartOfRegex = !inRegex &&
          ![')', ']', '}', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '_', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].includes(prevNonWhitespace);

        if (isStartOfRegex) {
          inRegex = true;
        } else if (inRegex && prevNonWhitespace !== '\\') {
          // Fin de regex si la barra no está escapada
          inRegex = false;
        }
      }

      // Manejar caracteres especiales en regex
      if (inRegex && char === '\\' && !escaped) {
        escaped = true;
        currentExpr += char;
        continue;
      }

      // Resetear estado de escape
      if (escaped) {
        escaped = false;
      }

      // Manejar paréntesis y otros delimitadores (solo si no estamos en string, regex o comentario)
      if (!inString && !inRegex && !inComment) {
        if (char === '(') parenLevel++;
        else if (char === ')') parenLevel--;
        else if (char === '{') braceLevel++;
        else if (char === '}') braceLevel--;
        else if (char === '[') bracketLevel++;
        else if (char === ']') bracketLevel--;
      }

      // Detectar fin de expresión solo si estamos en el nivel base (no anidados)
      if (char === ';' && !inString && !inRegex && !inComment &&
        parenLevel === 0 && braceLevel === 0 && bracketLevel === 0) {
        expressions.push(currentExpr + ';');
        currentExpr = '';
      } else {
        currentExpr += char;
      }
    }

    // Agregar cualquier expresión restante
    if (currentExpr.trim() !== '') {
      expressions.push(currentExpr);
    }

    // Procesar cada expresión individualmente
    return expressions.map(processExpression).join('');
  }).join('\n');
};

