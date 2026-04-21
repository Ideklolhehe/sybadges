/**
 * Translation rules: JavaScript  ↔  TypeScript
 *
 * JS → TS: add basic type annotations, convert `var` to `let`/`const`.
 * TS → JS: strip type annotations, replace `const`/`let` style declarations.
 */

import { TranslationRule } from '../types';

// ─── JavaScript → TypeScript ──────────────────────────────────────────────────

export const jsToTsRules: TranslationRule[] = [
  // var → let
  {
    description: 'var → let',
    pattern: /\bvar\b/g,
    replacement: 'let',
  },

  // function declarations: add `: void` return type where no return value is obvious
  {
    description: 'function declaration → add typed signature placeholder',
    pattern: /\bfunction\s+(\w+)\s*\(([^)]*)\)/g,
    replacement: (_match: string, name: string, params: string) => {
      const typedParams = params
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p) => `${p}: unknown`)
        .join(', ');
      return `function ${name}(${typedParams}): unknown`;
    },
  },

  // Arrow function parameters
  {
    description: 'Arrow function single param → add type',
    pattern: /\((\w+)\)\s*=>/g,
    replacement: '($1: unknown) =>',
  },
];

// ─── TypeScript → JavaScript ──────────────────────────────────────────────────

export const tsToJsRules: TranslationRule[] = [
  // Strip type annotations on variables
  {
    description: 'Strip variable type annotation',
    pattern: /:\s*(?:string|number|boolean|any|unknown|never|void|null|undefined|object|bigint|symbol)\b/g,
    replacement: '',
  },

  // Strip generic type parameters from function calls / new expressions
  {
    description: 'Strip generic type parameters (simple)',
    pattern: /<\s*(?:string|number|boolean|any|unknown|never|void)\s*>/g,
    replacement: '',
  },

  // Strip interface declarations (single-line; multi-line interfaces require manual removal)
  {
    description: 'Strip interface declaration (single-line)',
    pattern: /^\s*interface\s+\w+\s*\{[^}]*\}/gm,
    replacement: '// [interface removed]',
  },

  // Strip type alias declarations
  {
    description: 'Strip type alias',
    pattern: /^\s*type\s+\w+\s*=\s*[^;]+;/gm,
    replacement: '// [type alias removed]',
  },

  // Strip access modifiers
  {
    description: 'Strip access modifiers',
    pattern: /\b(?:public|private|protected|readonly)\s+/g,
    replacement: '',
  },

  // Strip return type annotations from functions
  {
    description: 'Strip function return type annotation',
    pattern: /\)\s*:\s*(?:string|number|boolean|any|unknown|never|void|null|undefined|object|Promise<[^>]+>|\w+)\s*(?=\{)/g,
    replacement: ') ',
  },

  // as casts
  {
    description: 'Strip "as Type" casts',
    pattern: /\s+as\s+\w+/g,
    replacement: '',
  },

  // Non-null assertion operator
  {
    description: 'Strip non-null assertion !',
    pattern: /(\w+)!/g,
    replacement: '$1',
  },
];
