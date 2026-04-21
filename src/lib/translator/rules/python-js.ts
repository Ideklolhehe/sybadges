/**
 * Translation rules: Python  →  JavaScript / TypeScript
 *
 * Each rule is applied in order on every line.  Rules that must span multiple
 * lines (e.g. indentation → braces) are handled separately in the engine.
 */

import { TranslationRule } from '../types';

// ─── Python → JavaScript ─────────────────────────────────────────────────────

export const pythonToJsRules: TranslationRule[] = [
  // Boolean / null literals
  {
    description: 'True → true',
    pattern: /\bTrue\b/g,
    replacement: 'true',
  },
  {
    description: 'False → false',
    pattern: /\bFalse\b/g,
    replacement: 'false',
  },
  {
    description: 'None → null',
    pattern: /\bNone\b/g,
    replacement: 'null',
  },

  // Logical operators
  {
    description: 'and → &&',
    pattern: /\band\b/g,
    replacement: '&&',
  },
  {
    description: 'or → ||',
    pattern: /\bor\b/g,
    replacement: '||',
  },
  {
    description: 'not → !',
    pattern: /\bnot\b\s*/g,
    replacement: '!',
  },

  // Identity operators
  {
    description: 'is not → !==',
    pattern: /\bis\s+not\b/g,
    replacement: '!==',
  },
  {
    description: 'is → ===',
    pattern: /\bis\b/g,
    replacement: '===',
  },

  // Arithmetic operators
  {
    description: '** (power) → **',
    // Python's ** already works in modern JS/TS — no change needed, but we add a note
    pattern: /(\w+)\s*\*\*\s*(\w+)/g,
    replacement: 'Math.pow($1, $2)',
  },
  {
    description: '// (floor division) → Math.floor(a/b)',
    pattern: /(\w+)\s*\/\/\s*(\w+)/g,
    replacement: 'Math.floor($1 / $2)',
  },

  // String methods
  {
    description: '.append( → .push(',
    pattern: /\.append\s*\(/g,
    replacement: '.push(',
  },
  {
    description: '.extend( → .push(...',
    pattern: /\.extend\s*\(([^)]+)\)/g,
    replacement: '.push(...$1)',
  },
  {
    description: 'len( → .length (best-effort)',
    pattern: /\blen\s*\(\s*([^)]+)\s*\)/g,
    replacement: '$1.length',
  },
  {
    description: '.strip() → .trim()',
    pattern: /\.strip\s*\(\s*\)/g,
    replacement: '.trim()',
  },
  {
    description: '.lstrip() → .trimStart()',
    pattern: /\.lstrip\s*\(\s*\)/g,
    replacement: '.trimStart()',
  },
  {
    description: '.rstrip() → .trimEnd()',
    pattern: /\.rstrip\s*\(\s*\)/g,
    replacement: '.trimEnd()',
  },
  {
    description: '.upper() → .toUpperCase()',
    pattern: /\.upper\s*\(\s*\)/g,
    replacement: '.toUpperCase()',
  },
  {
    description: '.lower() → .toLowerCase()',
    pattern: /\.lower\s*\(\s*\)/g,
    replacement: '.toLowerCase()',
  },
  {
    description: '.split( → .split(',
    pattern: /\.split\s*\(/g,
    replacement: '.split(',
  },
  {
    description: '.join( → .join(',
    pattern: /(\S+?)\.join\s*\(([^)]+)\)/g,
    replacement: '$2.join($1)',
  },
  {
    description: 'str.format → template literal (placeholder)',
    pattern: /f"([^"]*)"/g,
    replacement: (_match: string, inner: string) =>
      '`' + inner.replace(/\{([^}]+)\}/g, '${$1}') + '`',
  },
  {
    description: "f-string single quotes → template literal",
    pattern: /f'([^']*)'/g,
    replacement: (_match: string, inner: string) =>
      '`' + inner.replace(/\{([^}]+)\}/g, '${$1}') + '`',
  },

  // Built-in functions
  {
    description: 'print( → console.log(',
    pattern: /\bprint\s*\(/g,
    replacement: 'console.log(',
  },
  {
    description: 'input( → prompt(',
    pattern: /\binput\s*\(/g,
    replacement: 'prompt(',
  },
  {
    description: 'int( → parseInt(',
    pattern: /\bint\s*\(/g,
    replacement: 'parseInt(',
  },
  {
    description: 'float( → parseFloat(',
    pattern: /\bfloat\s*\(/g,
    replacement: 'parseFloat(',
  },
  {
    description: 'str( → String(',
    pattern: /\bstr\s*\(/g,
    replacement: 'String(',
  },
  {
    description: 'isinstance( → instanceof (wrapped)',
    pattern: /\bisinstance\s*\(\s*([^,]+),\s*([^)]+)\s*\)/g,
    replacement: '$1 instanceof $2',
  },
  {
    description: 'range(n) → Array.from({length: n}, (_,i)=>i)',
    pattern: /\brange\s*\(\s*(\w+)\s*\)/g,
    replacement: 'Array.from({ length: $1 }, (_, i) => i)',
  },
  {
    description: 'range(start, stop) → Array.from',
    pattern: /\brange\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/g,
    replacement: 'Array.from({ length: $2 - $1 }, (_, i) => i + $1)',
  },
  {
    description: 'enumerate( → entries wrapper (placeholder)',
    pattern: /\benumerate\s*\(([^)]+)\)/g,
    replacement: 'Object.entries($1)',
  },
  {
    description: 'zip( → placeholder (manual merge needed)',
    pattern: /\bzip\s*\(/g,
    replacement: '/* zip */ (',
  },
  {
    description: 'sorted( → .slice().sort(',
    pattern: /\bsorted\s*\(([^)]+)\)/g,
    replacement: '[...$1].sort()',
  },
  {
    description: 'reversed( → .slice().reverse()',
    pattern: /\breversed\s*\(([^)]+)\)/g,
    replacement: '[...$1].reverse()',
  },
  {
    description: 'list( → Array.from(',
    pattern: /\blist\s*\(/g,
    replacement: 'Array.from(',
  },
  {
    description: 'dict( → Object.fromEntries(',
    pattern: /\bdict\s*\(/g,
    replacement: 'Object.fromEntries(',
  },
  {
    description: 'set( → new Set(',
    pattern: /\bset\s*\(/g,
    replacement: 'new Set(',
  },
  {
    description: 'abs( → Math.abs(',
    pattern: /\babs\s*\(/g,
    replacement: 'Math.abs(',
  },
  {
    description: 'max( → Math.max(',
    pattern: /\bmax\s*\(/g,
    replacement: 'Math.max(',
  },
  {
    description: 'min( → Math.min(',
    pattern: /\bmin\s*\(/g,
    replacement: 'Math.min(',
  },
  {
    description: 'sum( → reduce sum (placeholder)',
    pattern: /\bsum\s*\(([^)]+)\)/g,
    replacement: '$1.reduce((a, b) => a + b, 0)',
  },
  {
    description: 'type( → typeof',
    pattern: /\btype\s*\(\s*([^)]+)\s*\)/g,
    replacement: 'typeof $1',
  },

  // Control flow keywords
  {
    description: 'elif → else if',
    pattern: /\belif\b/g,
    replacement: 'else if',
  },
  {
    description: 'pass → // pass',
    pattern: /^\s*pass\s*$/gm,
    replacement: '// pass',
  },

  // Exception handling
  {
    description: 'except Exception as e → catch (e)',
    pattern: /\bexcept\s+(\w+)\s+as\s+(\w+)\s*:/g,
    replacement: 'catch ($2) {  // $1',
  },
  {
    description: 'except → catch (e)',
    pattern: /\bexcept\s*:/g,
    replacement: 'catch (e) {',
  },
  {
    description: 'try: → try {',
    pattern: /^\s*try\s*:/gm,
    replacement: (m: string) => m.replace('try:', 'try {'),
  },
  {
    description: 'finally: → } finally {',
    pattern: /\bfinally\s*:/g,
    replacement: '} finally {',
  },
  {
    description: 'raise → throw new Error',
    pattern: /\braise\s+(\w+)\s*\(([^)]*)\)/g,
    replacement: 'throw new $1($2)',
  },
  {
    description: 'raise (bare) → throw new Error',
    pattern: /\braise\b/g,
    replacement: 'throw new Error',
  },

  // Import statements
  {
    description: 'import module → // import module (manual)',
    pattern: /^import\s+(\S+)/gm,
    replacement: "// import $1 from '$1'; // TODO: map to JS module",
  },
  {
    description: 'from x import y → // from x import y',
    pattern: /^from\s+(\S+)\s+import\s+(.+)/gm,
    replacement: "// import { $2 } from '$1'; // TODO: map to JS module",
  },

  // Type hints (strip them)
  {
    description: 'Strip Python type annotation in function args',
    pattern: /(\w+)\s*:\s*(?:int|float|str|bool|list|dict|set|tuple|Any|Optional|Union|List|Dict|Set|Tuple)\b/g,
    replacement: '$1',
  },
  {
    description: 'Strip return type annotation',
    pattern: /\)\s*->\s*(?:int|float|str|bool|list|dict|set|tuple|None|Any|Optional|Union|List|Dict|Set|Tuple)\s*:/g,
    replacement: ') {',
  },

  // Python comments
  {
    description: '# comment (already valid in JS) → keep',
    // JS supports // comments.  We convert # to //
    pattern: /#(.*)/g,
    replacement: '//$1',
  },
];

// ─── JavaScript → Python ─────────────────────────────────────────────────────

export const jsToPythonRules: TranslationRule[] = [
  // Boolean / null literals
  {
    description: 'true → True',
    pattern: /\btrue\b/g,
    replacement: 'True',
  },
  {
    description: 'false → False',
    pattern: /\bfalse\b/g,
    replacement: 'False',
  },
  {
    description: 'null → None',
    pattern: /\bnull\b/g,
    replacement: 'None',
  },
  {
    description: 'undefined → None',
    pattern: /\bundefined\b/g,
    replacement: 'None',
  },

  // Logical operators
  {
    description: '&& → and',
    pattern: /&&/g,
    replacement: 'and',
  },
  {
    description: '|| → or',
    pattern: /\|\|/g,
    replacement: 'or',
  },
  {
    description: '! → not (prefix)',
    pattern: /!(?!=)/g,
    replacement: 'not ',
  },

  // Strict equality
  {
    description: '=== → ==',
    pattern: /===/g,
    replacement: '==',
  },
  {
    description: '!== → !=',
    pattern: /!==/g,
    replacement: '!=',
  },

  // Arithmetic
  {
    description: 'Math.pow(a,b) → a ** b',
    pattern: /Math\.pow\s*\(\s*([^,]+),\s*([^)]+)\s*\)/g,
    replacement: '$1 ** $2',
  },
  {
    description: 'Math.floor(a/b) → a // b (simple form only)',
    pattern: /Math\.floor\s*\(\s*([^/]+)\s*\/\s*([^)]+)\s*\)/g,
    replacement: '$1 // $2',
  },
  {
    description: 'Math.abs( → abs(',
    pattern: /Math\.abs\s*\(/g,
    replacement: 'abs(',
  },
  {
    description: 'Math.max( → max(',
    pattern: /Math\.max\s*\(/g,
    replacement: 'max(',
  },
  {
    description: 'Math.min( → min(',
    pattern: /Math\.min\s*\(/g,
    replacement: 'min(',
  },

  // Array methods
  {
    description: '.push( → .append(',
    pattern: /\.push\s*\(/g,
    replacement: '.append(',
  },
  {
    description: '.length → len(x) (best-effort)',
    pattern: /(\w+)\.length\b/g,
    replacement: 'len($1)',
  },
  {
    description: '.includes( → in (converted below, placeholder)',
    pattern: /(\w+)\.includes\s*\(\s*([^)]+)\s*\)/g,
    replacement: '$2 in $1',
  },
  {
    description: '.indexOf( → .index(',
    pattern: /\.indexOf\s*\(/g,
    replacement: '.index(',
  },
  {
    description: '.join( → .join(',
    pattern: /(\S+?)\.join\s*\(\s*([^)]+)\s*\)/g,
    replacement: '$2.join($1)',
  },
  {
    description: '.slice( → [:]',
    // leave as-is; Python slice syntax requires manual fix
    pattern: /\.slice\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g,
    replacement: '[$1:$2]',
  },

  // String methods
  {
    description: '.trim() → .strip()',
    pattern: /\.trim\s*\(\s*\)/g,
    replacement: '.strip()',
  },
  {
    description: '.trimStart() → .lstrip()',
    pattern: /\.trimStart\s*\(\s*\)/g,
    replacement: '.lstrip()',
  },
  {
    description: '.trimEnd() → .rstrip()',
    pattern: /\.trimEnd\s*\(\s*\)/g,
    replacement: '.rstrip()',
  },
  {
    description: '.toUpperCase() → .upper()',
    pattern: /\.toUpperCase\s*\(\s*\)/g,
    replacement: '.upper()',
  },
  {
    description: '.toLowerCase() → .lower()',
    pattern: /\.toLowerCase\s*\(\s*\)/g,
    replacement: '.lower()',
  },

  // Template literals → f-strings
  {
    description: 'Template literals → f-strings',
    pattern: /`([^`]*)`/g,
    replacement: (_match: string, inner: string) =>
      'f"' + inner.replace(/\$\{([^}]+)\}/g, '{$1}') + '"',
  },

  // Built-in functions
  {
    description: 'console.log( → print(',
    pattern: /\bconsole\.log\s*\(/g,
    replacement: 'print(',
  },
  {
    description: 'console.error( → print( (stderr placeholder)',
    pattern: /\bconsole\.error\s*\(/g,
    replacement: 'print(',
  },
  {
    description: 'parseInt( → int(',
    pattern: /\bparseInt\s*\(/g,
    replacement: 'int(',
  },
  {
    description: 'parseFloat( → float(',
    pattern: /\bparseFloat\s*\(/g,
    replacement: 'float(',
  },
  {
    description: 'String( → str(',
    pattern: /\bString\s*\(/g,
    replacement: 'str(',
  },
  {
    description: 'Array.from( → list(',
    pattern: /\bArray\.from\s*\(/g,
    replacement: 'list(',
  },
  {
    description: 'new Set( → set(',
    pattern: /\bnew\s+Set\s*\(/g,
    replacement: 'set(',
  },
  {
    description: 'new Map( → dict(',
    pattern: /\bnew\s+Map\s*\(/g,
    replacement: 'dict(',
  },
  {
    description: 'typeof → type(',
    pattern: /\btypeof\s+(\w+)/g,
    replacement: 'type($1)',
  },
  {
    description: 'instanceof → isinstance(',
    pattern: /(\w+)\s+instanceof\s+(\w+)/g,
    replacement: 'isinstance($1, $2)',
  },

  // Variable declarations
  {
    description: 'const/let/var declaration',
    pattern: /\b(?:const|let|var)\s+/g,
    replacement: '',
  },

  // Control flow
  {
    description: 'else if → elif',
    pattern: /\belse\s+if\b/g,
    replacement: 'elif',
  },

  // Exception handling
  {
    description: 'catch (e) → except Exception as e:',
    pattern: /\bcatch\s*\(\s*(\w+)\s*\)\s*\{/g,
    replacement: 'except Exception as $1:',
  },
  {
    description: 'catch (no var) → except:',
    pattern: /\bcatch\s*\(\s*\)\s*\{/g,
    replacement: 'except:',
  },
  {
    description: '} finally { → finally:',
    pattern: /\}\s*finally\s*\{/g,
    replacement: 'finally:',
  },
  {
    description: 'throw new Error( → raise Exception(',
    pattern: /\bthrow\s+new\s+(\w+)\s*\(/g,
    replacement: 'raise $1(',
  },
  {
    description: 'throw → raise',
    pattern: /\bthrow\b/g,
    replacement: 'raise',
  },

  // Remove semicolons at end of lines
  {
    description: 'Remove trailing semicolons',
    pattern: /;(\s*)$/gm,
    replacement: '$1',
  },

  // Comments
  {
    description: '// comment → # comment',
    pattern: /\/\/(.*)/g,
    replacement: '#$1',
  },
  {
    description: '/* ... */ → # ... (inline, best-effort)',
    pattern: /\/\*([^*]*)\*\//g,
    replacement: '# $1',
  },

  // Imports
  {
    description: "import x from 'y' → import x  # from y",
    pattern: /^import\s+(\w+)\s+from\s+['"]([^'"]+)['"]\s*;?/gm,
    replacement: 'import $1  # from $2',
  },
  {
    description: "import { x } from 'y' → from y import x",
    pattern: /^import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]\s*;?/gm,
    replacement: 'from $2 import $1',
  },
];
