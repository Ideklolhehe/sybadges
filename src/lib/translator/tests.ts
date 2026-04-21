/**
 * Built-in test cases for the translation engine.
 *
 * Each test case defines a source snippet and the expected substring (or RegExp)
 * that MUST appear in the translated output.
 */

import { TestCase } from './types';

const testCases: TestCase[] = [
  // ── Python → JavaScript ────────────────────────────────────────────────────

  {
    id: 'py-js-print',
    description: 'Python print → console.log',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 'print("hello")',
    expectedPattern: 'console.log',
  },
  {
    id: 'py-js-bool-true',
    description: 'Python True → JavaScript true',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 'x = True',
    expectedPattern: 'true',
  },
  {
    id: 'py-js-bool-false',
    description: 'Python False → JavaScript false',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 'x = False',
    expectedPattern: 'false',
  },
  {
    id: 'py-js-none',
    description: 'Python None → JavaScript null',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 'x = None',
    expectedPattern: 'null',
  },
  {
    id: 'py-js-and',
    description: 'Python and → &&',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 'if a and b:',
    expectedPattern: '&&',
  },
  {
    id: 'py-js-or',
    description: 'Python or → ||',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 'if a or b:',
    expectedPattern: '||',
  },
  {
    id: 'py-js-elif',
    description: 'Python elif → else if',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 'elif x > 0:',
    expectedPattern: 'else if',
  },
  {
    id: 'py-js-append',
    description: 'Python .append() → .push()',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 'arr.append(1)',
    expectedPattern: '.push(',
  },
  {
    id: 'py-js-len',
    description: 'Python len() → .length',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 'n = len(arr)',
    expectedPattern: '.length',
  },
  {
    id: 'py-js-upper',
    description: 'Python .upper() → .toUpperCase()',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 's.upper()',
    expectedPattern: '.toUpperCase()',
  },
  {
    id: 'py-js-lower',
    description: 'Python .lower() → .toLowerCase()',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 's.lower()',
    expectedPattern: '.toLowerCase()',
  },
  {
    id: 'py-js-fstring',
    description: 'Python f-string → template literal',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 'msg = f"Hello {name}"',
    expectedPattern: '`Hello ${name}`',
  },
  {
    id: 'py-js-comment',
    description: 'Python # comment → // comment',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: '# This is a comment',
    expectedPattern: '//',
  },
  {
    id: 'py-js-power',
    description: 'Python ** → Math.pow',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 'result = x ** 2',
    expectedPattern: 'Math.pow',
  },
  {
    id: 'py-js-range',
    description: 'Python range() → Array.from',
    sourceLang: 'python',
    targetLang: 'javascript',
    sourceCode: 'for i in range(10):',
    expectedPattern: 'Array.from',
  },

  // ── JavaScript → Python ────────────────────────────────────────────────────

  {
    id: 'js-py-print',
    description: 'JS console.log → Python print',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: 'console.log("hello");',
    expectedPattern: 'print(',
  },
  {
    id: 'js-py-bool-true',
    description: 'JS true → Python True',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: 'const x = true;',
    expectedPattern: 'True',
  },
  {
    id: 'js-py-bool-false',
    description: 'JS false → Python False',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: 'const x = false;',
    expectedPattern: 'False',
  },
  {
    id: 'js-py-null',
    description: 'JS null → Python None',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: 'const x = null;',
    expectedPattern: 'None',
  },
  {
    id: 'js-py-and',
    description: 'JS && → Python and',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: 'if (a && b) {',
    expectedPattern: 'and',
  },
  {
    id: 'js-py-or',
    description: 'JS || → Python or',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: 'if (a || b) {',
    expectedPattern: 'or',
  },
  {
    id: 'js-py-elif',
    description: 'JS else if → Python elif',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: 'else if (x > 0) {',
    expectedPattern: 'elif',
  },
  {
    id: 'js-py-push',
    description: 'JS .push() → Python .append()',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: 'arr.push(1);',
    expectedPattern: '.append(',
  },
  {
    id: 'js-py-template',
    description: 'JS template literal → Python f-string',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: 'const msg = `Hello ${name}`;',
    expectedPattern: 'f"Hello {name}"',
  },
  {
    id: 'js-py-semicolon',
    description: 'JS trailing semicolons removed',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: 'const x = 5;',
    expectedPattern: /x = 5\s*$/m,
  },
  {
    id: 'js-py-var-decl',
    description: 'JS const/let/var removed',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: 'const x = 42;',
    expectedPattern: /^x = 42/m,
  },
  {
    id: 'js-py-strict-eq',
    description: 'JS === → Python ==',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: 'if (x === 5)',
    expectedPattern: '==',
  },
  {
    id: 'js-py-comment',
    description: 'JS // comment → Python # comment',
    sourceLang: 'javascript',
    targetLang: 'python',
    sourceCode: '// This is a comment',
    expectedPattern: '#',
  },

  // ── Python → Java ──────────────────────────────────────────────────────────

  {
    id: 'py-java-print',
    description: 'Python print → System.out.println',
    sourceLang: 'python',
    targetLang: 'java',
    sourceCode: 'print("hello")',
    expectedPattern: 'System.out.println',
  },
  {
    id: 'py-java-bool',
    description: 'Python True → Java true',
    sourceLang: 'python',
    targetLang: 'java',
    sourceCode: 'x = True',
    expectedPattern: 'true',
  },
  {
    id: 'py-java-none',
    description: 'Python None → Java null',
    sourceLang: 'python',
    targetLang: 'java',
    sourceCode: 'x = None',
    expectedPattern: 'null',
  },

  // ── Python → C++ ──────────────────────────────────────────────────────────

  {
    id: 'py-cpp-print',
    description: 'Python print → std::cout',
    sourceLang: 'python',
    targetLang: 'cpp',
    sourceCode: 'print("hello")',
    expectedPattern: 'std::cout',
  },
  {
    id: 'py-cpp-bool',
    description: 'Python True → C++ true',
    sourceLang: 'python',
    targetLang: 'cpp',
    sourceCode: 'x = True',
    expectedPattern: 'true',
  },
  {
    id: 'py-cpp-none',
    description: 'Python None → C++ nullptr',
    sourceLang: 'python',
    targetLang: 'cpp',
    sourceCode: 'x = None',
    expectedPattern: 'nullptr',
  },
  {
    id: 'py-cpp-includes',
    description: 'C++ output has standard includes',
    sourceLang: 'python',
    targetLang: 'cpp',
    sourceCode: 'print("hello")',
    expectedPattern: '#include',
  },

  // ── Java → Python ──────────────────────────────────────────────────────────

  {
    id: 'java-py-print',
    description: 'Java System.out.println → Python print',
    sourceLang: 'java',
    targetLang: 'python',
    sourceCode: 'System.out.println("hello");',
    expectedPattern: 'print(',
  },
  {
    id: 'java-py-bool',
    description: 'Java true → Python True',
    sourceLang: 'java',
    targetLang: 'python',
    sourceCode: 'boolean x = true;',
    expectedPattern: 'True',
  },
  {
    id: 'java-py-semicolon',
    description: 'Java semicolons removed',
    sourceLang: 'java',
    targetLang: 'python',
    sourceCode: 'int x = 5;',
    expectedPattern: /x = 5\s*$/m,
  },

  // ── C++ → Python ──────────────────────────────────────────────────────────

  {
    id: 'cpp-py-cout',
    description: 'C++ std::cout → Python print',
    sourceLang: 'cpp',
    targetLang: 'python',
    sourceCode: 'std::cout << "hello" << std::endl;',
    expectedPattern: 'print(',
  },
  {
    id: 'cpp-py-nullptr',
    description: 'C++ nullptr → Python None',
    sourceLang: 'cpp',
    targetLang: 'python',
    sourceCode: 'int* p = nullptr;',
    expectedPattern: 'None',
  },

  // ── JavaScript → TypeScript ────────────────────────────────────────────────

  {
    id: 'js-ts-var',
    description: 'JS var → TS let',
    sourceLang: 'javascript',
    targetLang: 'typescript',
    sourceCode: 'var x = 5;',
    expectedPattern: 'let',
  },
];

export function getTestCases(): TestCase[] {
  return testCases;
}
