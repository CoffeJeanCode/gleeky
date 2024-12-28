//@ts-nocheck
const indexOf = <T>(xs: T[], item: T): number => {
  if (xs.indexOf) return xs.indexOf(item);
  else
    for (let i = 0; i < xs.length; i++) {
      if (xs[i] === item) return i;
    }
  return -1;
};

const Object_keys = (obj: Record<string, any>): string[] => {
  if (Object.keys) return Object.keys(obj);
  else {
    const res: string[] = [];
    for (const key in obj) res.push(key);
    return res;
  }
};

const forEach = <T>(
  xs: T[],
  fn: (item: T, index: number, array: T[]) => void
): void => {
  if (xs.forEach) return xs.forEach(fn);
  else
    for (let i = 0; i < xs.length; i++) {
      fn(xs[i], i, xs);
    }
};

const defineProp = (() => {
  try {
    Object.defineProperty({}, '_', {});
    return function (obj: Record<string, any>, name: string, value: any) {
      Object.defineProperty(obj, name, {
        writable: true,
        enumerable: false,
        configurable: true,
        value: value,
      });
    };
  } catch (e) {
    return function (obj: Record<string, any>, name: string, value: any) {
      obj[name] = value;
    };
  }
})();

const globals = [
  'Array',
  'Boolean',
  'Date',
  'Error',
  'EvalError',
  'Function',
  'Infinity',
  'JSON',
  'Math',
  'NaN',
  'Number',
  'Object',
  'RangeError',
  'ReferenceError',
  'RegExp',
  'String',
  'SyntaxError',
  'TypeError',
  'URIError',
  'decodeURI',
  'decodeURIComponent',
  'encodeURI',
  'encodeURIComponent',
  'escape',
  'eval',
  'isFinite',
  'isNaN',
  'parseFloat',
  'parseInt',
  'undefined',
  'unescape',
  'fetch',
  'Promise',
];

interface WindowWithEval extends Window {
  eval?: (x: string) => any;
  execScript?: (x: string) => void;
  [key: string]: any;
}

class Context {
  constructor(public data: Record<string, any> = {}) { }

  addProperty(name: string, value: any): void {
    this.data[name] = value;
  }
}

class Script {
  code: string;

  constructor(code: string) {
    this.code = code;
  }

  runInContext(context: Context): any {
    if (!(context instanceof Context)) {
      throw new TypeError("needs a 'context' argument.");
    }

    const iframe = document.createElement('iframe');
    const iframeStyle = iframe.style as CSSStyleDeclaration;
    iframeStyle.display = 'none';

    document.body.appendChild(iframe);

    const win = iframe.contentWindow as WindowWithEval;
    if (!win) throw new Error('Failed to get iframe window');

    let wEval = win.eval;
    let wExecScript = win.execScript;

    if (!wEval && wExecScript) {
      wExecScript.call(win, 'null');
      wEval = win.eval;
    }

    if (!wEval) throw new Error('No eval function available');

    forEach(Object_keys(context.data), function (key) {
      win[key] = context.data[key];
    });

    forEach(globals, function (key) {
      if (context.data[key]) {
        win[key] = context.data[key];
      }
    });

    const winKeys = Object_keys(win);

    const res = wEval.call(win, this.code);

    forEach(Object_keys(win), function (key: string) {
      if (key in context.data || indexOf(winKeys, key) === -1) {
        context.data[key] = win[key];
      }
    });

    forEach(globals, function (key) {
      if (!(key in context.data)) {
        defineProp(context.data, key, win[key]);
      }
    });

    document.body.removeChild(iframe);

    return res;
  }

  runInThisContext(): any {
    return eval(this.code);
  }

  runInNewContext(context: Context): any {
    const ctx = Script.createContext(context);
    const res = this.runInContext(ctx);

    if (context) {
      forEach(Object_keys(ctx.data), function (key) {
        context.data[key] = ctx.data[key];
      });
    }

    return res;
  }

  static createContext(context: Context): Context {
    const copy = new Context();
    if (context instanceof Context) {
      forEach(Object_keys(context.data), function (key) {
        copy.addProperty(key, context.data[key]);
      });
    }
    return copy;
  }
}

export { Context, Script };