/**
 * Translation rules: Python  ↔  Java
 */

import { TranslationRule } from '../types';

// ─── Python → Java ────────────────────────────────────────────────────────────

export const pythonToJavaRules: TranslationRule[] = [
  // Boolean / null literals
  { description: 'True → true', pattern: /\bTrue\b/g, replacement: 'true' },
  { description: 'False → false', pattern: /\bFalse\b/g, replacement: 'false' },
  { description: 'None → null', pattern: /\bNone\b/g, replacement: 'null' },

  // Logical operators
  { description: 'and → &&', pattern: /\band\b/g, replacement: '&&' },
  { description: 'or → ||', pattern: /\bor\b/g, replacement: '||' },
  { description: 'not → !', pattern: /\bnot\b\s*/g, replacement: '!' },

  // Identity operators
  { description: 'is not → !=', pattern: /\bis\s+not\b/g, replacement: '!=' },
  { description: 'is → ==', pattern: /\bis\b/g, replacement: '==' },

  // Power operator
  {
    description: '** → Math.pow',
    pattern: /(\w+)\s*\*\*\s*(\w+)/g,
    replacement: 'Math.pow($1, $2)',
  },
  {
    description: '// (floor div) → (int)Math.floor',
    pattern: /(\w+)\s*\/\/\s*(\w+)/g,
    replacement: '(int)Math.floor((double)$1 / $2)',
  },

  // Print
  { description: 'print( → System.out.println(', pattern: /\bprint\s*\(/g, replacement: 'System.out.println(' },

  // String methods
  { description: '.append( → .add(', pattern: /\.append\s*\(/g, replacement: '.add(' },
  { description: '.strip() → .trim()', pattern: /\.strip\s*\(\s*\)/g, replacement: '.trim()' },
  { description: '.upper() → .toUpperCase()', pattern: /\.upper\s*\(\s*\)/g, replacement: '.toUpperCase()' },
  { description: '.lower() → .toLowerCase()', pattern: /\.lower\s*\(\s*\)/g, replacement: '.toLowerCase()' },
  {
    description: 'len( → .size() / .length',
    pattern: /\blen\s*\(\s*([^)]+)\s*\)/g,
    replacement: '$1.size()',
  },

  // Built-ins
  { description: 'int( → Integer.parseInt(', pattern: /\bint\s*\(/g, replacement: 'Integer.parseInt(' },
  { description: 'float( → Double.parseDouble(', pattern: /\bfloat\s*\(/g, replacement: 'Double.parseDouble(' },
  { description: 'str( → String.valueOf(', pattern: /\bstr\s*\(/g, replacement: 'String.valueOf(' },
  { description: 'abs( → Math.abs(', pattern: /\babs\s*\(/g, replacement: 'Math.abs(' },
  { description: 'max( → Math.max(', pattern: /\bmax\s*\(/g, replacement: 'Math.max(' },
  { description: 'min( → Math.min(', pattern: /\bmin\s*\(/g, replacement: 'Math.min(' },

  // Control flow
  { description: 'elif → else if', pattern: /\belif\b/g, replacement: 'else if' },
  { description: 'pass → // pass', pattern: /^\s*pass\s*$/gm, replacement: '    // pass' },

  // Exception handling
  {
    description: 'except Exception as e → catch (Exception e)',
    pattern: /\bexcept\s+(\w+)\s+as\s+(\w+)\s*:/g,
    replacement: 'catch ($1 $2) {',
  },
  { description: 'except → catch (Exception e)', pattern: /\bexcept\s*:/g, replacement: 'catch (Exception e) {' },
  { description: 'finally: → } finally {', pattern: /\bfinally\s*:/g, replacement: '} finally {' },
  { description: 'raise → throw new RuntimeException', pattern: /\braise\b/g, replacement: 'throw new RuntimeException' },

  // f-strings → String.format
  {
    description: 'f-strings → String.format',
    pattern: /f"([^"]*)"/g,
    replacement: (_match: string, inner: string) => {
      const vars: string[] = [];
      const formatted = inner.replace(/\{([^}]+)\}/g, (_m, v) => {
        vars.push(v.trim());
        return '%s';
      });
      return vars.length > 0 ? `String.format("${formatted}", ${vars.join(', ')})` : `"${formatted}"`;
    },
  },

  // Comments
  { description: '# comment → // comment', pattern: /#(.*)/g, replacement: '//$1' },

  // Imports
  {
    description: 'import x → import x; // TODO: map',
    pattern: /^import\s+(\S+)/gm,
    replacement: 'import $1; // TODO: map to Java package',
  },
  {
    description: 'from x import y → import x.y',
    pattern: /^from\s+(\S+)\s+import\s+(\S+)/gm,
    replacement: 'import $1.$2;',
  },
];

// ─── Java → Python ────────────────────────────────────────────────────────────

export const javaToPythonRules: TranslationRule[] = [
  // Boolean / null
  { description: 'true → True', pattern: /\btrue\b/g, replacement: 'True' },
  { description: 'false → False', pattern: /\bfalse\b/g, replacement: 'False' },
  { description: 'null → None', pattern: /\bnull\b/g, replacement: 'None' },

  // Logical operators
  { description: '&& → and', pattern: /&&/g, replacement: 'and' },
  { description: '|| → or', pattern: /\|\|/g, replacement: 'or' },
  { description: '! → not ', pattern: /!(?!=)/g, replacement: 'not ' },

  // Strict equality
  { description: '== → ==', pattern: /(?<![=!<>])===?(?!=)/g, replacement: '==' },
  { description: '!= → !=', pattern: /!=/g, replacement: '!=' },

  // Math
  { description: 'Math.pow( → **', pattern: /Math\.pow\s*\(\s*([^,]+),\s*([^)]+)\s*\)/g, replacement: '$1 ** $2' },
  { description: 'Math.abs( → abs(', pattern: /Math\.abs\s*\(/g, replacement: 'abs(' },
  { description: 'Math.max( → max(', pattern: /Math\.max\s*\(/g, replacement: 'max(' },
  { description: 'Math.min( → min(', pattern: /Math\.min\s*\(/g, replacement: 'min(' },

  // Print
  { description: 'System.out.println( → print(', pattern: /System\.out\.println\s*\(/g, replacement: 'print(' },
  { description: 'System.out.print( → print(end=""', pattern: /System\.out\.print\s*\(/g, replacement: 'print(end=""' },

  // String methods
  { description: '.add( → .append(', pattern: /\.add\s*\(/g, replacement: '.append(' },
  { description: '.size() → len(x)', pattern: /(\w+)\.size\s*\(\s*\)/g, replacement: 'len($1)' },
  { description: '.length() → len(x)', pattern: /(\w+)\.length\s*\(\s*\)/g, replacement: 'len($1)' },
  { description: '.trim() → .strip()', pattern: /\.trim\s*\(\s*\)/g, replacement: '.strip()' },
  { description: '.toUpperCase() → .upper()', pattern: /\.toUpperCase\s*\(\s*\)/g, replacement: '.upper()' },
  { description: '.toLowerCase() → .lower()', pattern: /\.toLowerCase\s*\(\s*\)/g, replacement: '.lower()' },

  // Built-ins
  { description: 'Integer.parseInt( → int(', pattern: /Integer\.parseInt\s*\(/g, replacement: 'int(' },
  { description: 'Double.parseDouble( → float(', pattern: /Double\.parseDouble\s*\(/g, replacement: 'float(' },
  { description: 'String.valueOf( → str(', pattern: /String\.valueOf\s*\(/g, replacement: 'str(' },

  // Strip Java type declarations on variables
  {
    description: 'Strip Java type declaration',
    pattern: /\b(?:int|long|double|float|boolean|String|char|byte|short|void)\s+(\w+)\s*=/g,
    replacement: '$1 =',
  },

  // Strip access modifiers
  { description: 'Strip access modifiers', pattern: /\b(?:public|private|protected|static|final|abstract)\s+/g, replacement: '' },

  // Exception handling
  { description: 'catch (Exception e) → except Exception as e:', pattern: /\bcatch\s*\(\s*(\w+)\s+(\w+)\s*\)\s*\{/g, replacement: 'except $1 as $2:' },
  { description: '} finally { → finally:', pattern: /\}\s*finally\s*\{/g, replacement: 'finally:' },
  { description: 'throw new → raise', pattern: /\bthrow\s+new\s+(\w+)\s*\(/g, replacement: 'raise $1(' },
  { description: 'throw → raise', pattern: /\bthrow\b/g, replacement: 'raise' },

  // Else-if
  { description: 'else if → elif', pattern: /\belse\s+if\b/g, replacement: 'elif' },

  // Remove semicolons
  { description: 'Remove trailing semicolons', pattern: /;(\s*)$/gm, replacement: '$1' },

  // Comments
  { description: '// comment → # comment', pattern: /\/\/(.*)/g, replacement: '#$1' },
  { description: '/* */ → #', pattern: /\/\*([^*]*)\*\//g, replacement: '# $1' },

  // Imports
  { description: 'import x.y → from x import y', pattern: /^import\s+(\S+)\.(\S+);/gm, replacement: 'from $1 import $2' },
];
