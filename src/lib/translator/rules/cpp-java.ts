/**
 * Translation rules: Python  ↔  C++
 * and Java  ↔  C++
 */

import { TranslationRule } from '../types';

// ─── Python → C++ ────────────────────────────────────────────────────────────

export const pythonToCppRules: TranslationRule[] = [
  // Boolean / null
  { description: 'True → true', pattern: /\bTrue\b/g, replacement: 'true' },
  { description: 'False → false', pattern: /\bFalse\b/g, replacement: 'false' },
  { description: 'None → nullptr', pattern: /\bNone\b/g, replacement: 'nullptr' },

  // Logical operators
  { description: 'and → &&', pattern: /\band\b/g, replacement: '&&' },
  { description: 'or → ||', pattern: /\bor\b/g, replacement: '||' },
  { description: 'not → !', pattern: /\bnot\b\s*/g, replacement: '!' },

  // Power
  { description: '** → pow(', pattern: /(\w+)\s*\*\*\s*(\w+)/g, replacement: 'pow($1, $2)' },
  { description: '// floor div → (int)($1/$2)', pattern: /(\w+)\s*\/\/\s*(\w+)/g, replacement: '(int)($1 / $2)' },

  // Print
  { description: 'print( → std::cout <<', pattern: /\bprint\s*\(([^)]+)\)/g, replacement: 'std::cout << $1 << std::endl' },

  // String methods
  { description: 'len( → .size()', pattern: /\blen\s*\(\s*([^)]+)\s*\)/g, replacement: '$1.size()' },
  { description: '.append( → .push_back(', pattern: /\.append\s*\(/g, replacement: '.push_back(' },
  { description: '.strip() → /* .trim() — use custom */', pattern: /\.strip\s*\(\s*\)/g, replacement: '/* .trim() — implement manually */' },
  { description: '.upper() → /* .toUpper() — use boost */', pattern: /\.upper\s*\(\s*\)/g, replacement: '/* .toUpper() — use boost::to_upper_copy() */' },
  { description: '.lower() → /* .toLower() */', pattern: /\.lower\s*\(\s*\)/g, replacement: '/* .toLower() — use boost::to_lower_copy() */' },

  // Built-ins
  { description: 'int( → stoi(', pattern: /\bint\s*\(/g, replacement: 'stoi(' },
  { description: 'float( → stof(', pattern: /\bfloat\s*\(/g, replacement: 'stof(' },
  { description: 'str( → to_string(', pattern: /\bstr\s*\(/g, replacement: 'std::to_string(' },
  { description: 'abs( → abs(', pattern: /\babs\s*\(/g, replacement: 'abs(' },
  { description: 'max( → max(', pattern: /\bmax\s*\(/g, replacement: 'std::max(' },
  { description: 'min( → min(', pattern: /\bmin\s*\(/g, replacement: 'std::min(' },

  // Control flow
  { description: 'elif → else if', pattern: /\belif\b/g, replacement: 'else if' },
  { description: 'pass → /* pass */', pattern: /^\s*pass\s*$/gm, replacement: '    /* pass */' },

  // Exception handling
  { description: 'except Exception as e → catch (...)', pattern: /\bexcept\s+\w+\s+as\s+(\w+)\s*:/g, replacement: 'catch (const std::exception& $1) {' },
  { description: 'except: → catch (...)', pattern: /\bexcept\s*:/g, replacement: 'catch (...) {' },
  { description: 'raise → throw std::runtime_error', pattern: /\braise\b/g, replacement: 'throw std::runtime_error' },
  { description: 'finally: → /* finally */', pattern: /\bfinally\s*:/g, replacement: '/* finally: C++ has no finally; use RAII */' },

  // f-strings → string concatenation placeholder
  {
    description: 'f-strings → string concat (placeholder)',
    pattern: /f"([^"]*)"/g,
    replacement: (_m: string, inner: string) => {
      const s = inner.replace(/\{([^}]+)\}/g, '" + std::to_string($1) + "');
      return `"${s}"`;
    },
  },

  // Comments
  { description: '# comment → // comment', pattern: /#(.*)/g, replacement: '//$1' },

  // Imports → includes
  {
    description: 'import x → #include (placeholder)',
    pattern: /^import\s+(\S+)/gm,
    replacement: '#include <$1>  // TODO: map to C++ header',
  },
  {
    description: 'from x import y → #include',
    pattern: /^from\s+(\S+)\s+import\s+(.+)/gm,
    replacement: '// from $1 import $2 — map to #include',
  },
];

// ─── C++ → Python ────────────────────────────────────────────────────────────

export const cppToPythonRules: TranslationRule[] = [
  // Boolean / null
  { description: 'true → True', pattern: /\btrue\b/g, replacement: 'True' },
  { description: 'false → False', pattern: /\bfalse\b/g, replacement: 'False' },
  { description: 'nullptr → None', pattern: /\bnullptr\b/g, replacement: 'None' },
  { description: 'NULL → None', pattern: /\bNULL\b/g, replacement: 'None' },

  // Logical operators
  { description: '&& → and', pattern: /&&/g, replacement: 'and' },
  { description: '|| → or', pattern: /\|\|/g, replacement: 'or' },
  { description: '! → not', pattern: /!(?!=)/g, replacement: 'not ' },

  // Math
  { description: 'pow( → **', pattern: /\bpow\s*\(\s*([^,]+),\s*([^)]+)\s*\)/g, replacement: '$1 ** $2' },
  { description: 'std::max( → max(', pattern: /std::max\s*\(/g, replacement: 'max(' },
  { description: 'std::min( → min(', pattern: /std::min\s*\(/g, replacement: 'min(' },
  { description: 'abs( → abs(', pattern: /\babs\s*\(/g, replacement: 'abs(' },

  // cout → print
  {
    description: 'std::cout << ... << std::endl → print(...)',
    pattern: /std::cout\s*<<\s*(.+?)\s*<<\s*std::endl;?/g,
    replacement: 'print($1)',
  },
  {
    description: 'cout << ... << endl → print(...)',
    pattern: /cout\s*<<\s*(.+?)\s*<<\s*endl;?/g,
    replacement: 'print($1)',
  },
  {
    description: 'cout << ... → print(...)',
    pattern: /(?:std::)?cout\s*<<\s*(.+?);/g,
    replacement: 'print($1)',
  },

  // String
  { description: '.size() → len(x)', pattern: /(\w+)\.size\s*\(\s*\)/g, replacement: 'len($1)' },
  { description: '.length() → len(x)', pattern: /(\w+)\.length\s*\(\s*\)/g, replacement: 'len($1)' },
  { description: '.push_back( → .append(', pattern: /\.push_back\s*\(/g, replacement: '.append(' },
  { description: 'stoi( → int(', pattern: /\bstoi\s*\(/g, replacement: 'int(' },
  { description: 'stof( → float(', pattern: /\bstof\s*\(/g, replacement: 'float(' },
  { description: 'std::to_string( → str(', pattern: /std::to_string\s*\(/g, replacement: 'str(' },

  // Strip type declarations
  { description: 'Strip type declarations', pattern: /\b(?:int|long|double|float|char|bool|void|auto|string|std::string)\s+(\w+)\s*=/g, replacement: '$1 =' },

  // Control flow
  { description: 'else if → elif', pattern: /\belse\s+if\b/g, replacement: 'elif' },

  // Exception
  { description: 'catch (...) → except:', pattern: /\bcatch\s*\(\s*\.\.\.\s*\)\s*\{/g, replacement: 'except:' },
  { description: 'catch (const std::exception& e) → except Exception as e:', pattern: /\bcatch\s*\(\s*const\s+std::exception&\s+(\w+)\s*\)\s*\{/g, replacement: 'except Exception as $1:' },
  { description: 'throw → raise', pattern: /\bthrow\b/g, replacement: 'raise' },

  // Remove semicolons
  { description: 'Remove semicolons', pattern: /;(\s*)$/gm, replacement: '$1' },

  // Comments
  { description: '// → #', pattern: /\/\/(.*)/g, replacement: '#$1' },
  { description: '/* */ → #', pattern: /\/\*([^*]*)\*\//g, replacement: '# $1' },

  // Includes → imports
  {
    description: '#include → import (placeholder)',
    pattern: /^#include\s+[<"]([^>"]+)[>"]/gm,
    replacement: '# import $1  # TODO: map to Python module',
  },
];

// ─── Java → C++ ──────────────────────────────────────────────────────────────

export const javaToCppRules: TranslationRule[] = [
  // Literals
  { description: 'true/false → true/false (same)', pattern: /\btrue\b/g, replacement: 'true' },
  { description: 'null → nullptr', pattern: /\bnull\b/g, replacement: 'nullptr' },

  // Print
  { description: 'System.out.println( → std::cout <<', pattern: /System\.out\.println\s*\(([^)]+)\)/g, replacement: 'std::cout << $1 << std::endl' },
  { description: 'System.out.print( → std::cout <<', pattern: /System\.out\.print\s*\(([^)]+)\)/g, replacement: 'std::cout << $1' },

  // Types
  { description: 'String → std::string', pattern: /\bString\b/g, replacement: 'std::string' },
  { description: 'ArrayList → std::vector', pattern: /\bArrayList\b/g, replacement: 'std::vector' },
  { description: 'HashMap → std::map', pattern: /\bHashMap\b/g, replacement: 'std::map' },

  // Built-ins
  { description: 'Integer.parseInt( → stoi(', pattern: /Integer\.parseInt\s*\(/g, replacement: 'stoi(' },
  { description: 'Double.parseDouble( → stod(', pattern: /Double\.parseDouble\s*\(/g, replacement: 'stod(' },
  { description: 'String.valueOf( → std::to_string(', pattern: /String\.valueOf\s*\(/g, replacement: 'std::to_string(' },
  { description: 'Math.pow( → pow(', pattern: /Math\.pow\s*\(/g, replacement: 'pow(' },
  { description: 'Math.abs( → abs(', pattern: /Math\.abs\s*\(/g, replacement: 'abs(' },
  { description: 'Math.max( → std::max(', pattern: /Math\.max\s*\(/g, replacement: 'std::max(' },
  { description: 'Math.min( → std::min(', pattern: /Math\.min\s*\(/g, replacement: 'std::min(' },

  // Exception
  { description: 'catch (Exception e) → catch (...)', pattern: /\bcatch\s*\(\s*(\w+)\s+(\w+)\s*\)/g, replacement: 'catch (const std::exception& $2)' },
  { description: 'throw new → throw', pattern: /\bthrow\s+new\s+(\w+)\s*\(/g, replacement: 'throw std::runtime_error(' },

  // Remove access modifiers
  { description: 'Strip access modifiers', pattern: /\b(?:public|private|protected|static|final|abstract)\s+/g, replacement: '' },

  // Comments
  { description: '// → // (same)', pattern: /\/\/(.*)/g, replacement: '//$1' },

  // Imports → includes
  { description: 'import x.y → #include placeholder', pattern: /^import\s+\S+;/gm, replacement: '// #include <...>  // TODO: map Java import to C++ header' },
];

// ─── C++ → Java ──────────────────────────────────────────────────────────────

export const cppToJavaRules: TranslationRule[] = [
  // Literals
  { description: 'nullptr → null', pattern: /\bnullptr\b/g, replacement: 'null' },
  { description: 'NULL → null', pattern: /\bNULL\b/g, replacement: 'null' },

  // Print
  { description: 'std::cout << ... << std::endl → System.out.println(...)', pattern: /std::cout\s*<<\s*(.+?)\s*<<\s*std::endl;?/g, replacement: 'System.out.println($1);' },
  { description: 'cout << ... << endl → System.out.println(...)', pattern: /cout\s*<<\s*(.+?)\s*<<\s*endl;?/g, replacement: 'System.out.println($1);' },

  // Types
  { description: 'std::string → String', pattern: /std::string/g, replacement: 'String' },
  { description: 'std::vector → ArrayList', pattern: /std::vector/g, replacement: 'ArrayList' },
  { description: 'std::map → HashMap', pattern: /std::map/g, replacement: 'HashMap' },

  // Built-ins
  { description: 'stoi( → Integer.parseInt(', pattern: /\bstoi\s*\(/g, replacement: 'Integer.parseInt(' },
  { description: 'stod( → Double.parseDouble(', pattern: /\bstod\s*\(/g, replacement: 'Double.parseDouble(' },
  { description: 'std::to_string( → String.valueOf(', pattern: /std::to_string\s*\(/g, replacement: 'String.valueOf(' },
  { description: 'pow( → Math.pow(', pattern: /\bpow\s*\(/g, replacement: 'Math.pow(' },
  { description: 'abs( → Math.abs(', pattern: /\babs\s*\(/g, replacement: 'Math.abs(' },
  { description: 'std::max( → Math.max(', pattern: /std::max\s*\(/g, replacement: 'Math.max(' },
  { description: 'std::min( → Math.min(', pattern: /std::min\s*\(/g, replacement: 'Math.min(' },

  // Exception
  { description: 'catch (...) → catch (Exception e)', pattern: /\bcatch\s*\(\s*\.\.\.\s*\)/g, replacement: 'catch (Exception e)' },
  { description: 'throw std::runtime_error( → throw new RuntimeException(', pattern: /throw\s+std::runtime_error\s*\(/g, replacement: 'throw new RuntimeException(' },
  { description: 'throw → throw new RuntimeException', pattern: /\bthrow\b/g, replacement: 'throw new RuntimeException' },

  // Strip std:: namespace
  { description: 'strip std::', pattern: /std::/g, replacement: '' },

  // Comments stay the same
  { description: '// → //', pattern: /\/\/(.*)/g, replacement: '//$1' },

  // #include → import
  { description: '#include → import placeholder', pattern: /^#include\s+[<"]([^>"]+)[>"]/gm, replacement: '// import ...;  // TODO: map $1 to Java import' },
];
