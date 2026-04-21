/**
 * Core translation engine.
 *
 * Provides:
 *  - applyRules()            — apply line-by-line regex rules
 *  - convertIndentToBlocks() — Python indentation → brace-based blocks
 *  - convertBlocksToIndent() — brace-based blocks → Python indentation
 *  - translate()             — the main entry point
 */

import { Language, TranslationRule, TranslationRequest, TranslationResult } from './types';
import { pythonToJsRules, jsToPythonRules } from './rules/python-js';
import { jsToTsRules, tsToJsRules } from './rules/js-ts';
import { pythonToJavaRules, javaToPythonRules } from './rules/python-java';
import { pythonToCppRules, cppToPythonRules, javaToCppRules, cppToJavaRules } from './rules/cpp-java';
import { getTestCases } from './tests';

// ─── Rule application ─────────────────────────────────────────────────────────

/**
 * Apply an array of translation rules to `code`.
 * Each rule's `pattern` is applied globally, in order.
 * Rules with function replacements are called as `String.replace(pattern, fn)`.
 */
export function applyRules(code: string, rules: TranslationRule[]): string {
  let result = code;
  for (const rule of rules) {
    if (typeof rule.replacement === 'function') {
      // TypeScript does not narrow the overload automatically, so we cast.
      result = result.replace(rule.pattern, rule.replacement as (...args: string[]) => string);
    } else {
      result = result.replace(rule.pattern, rule.replacement as string);
    }
  }
  return result;
}

// ─── Block-structure conversion ───────────────────────────────────────────────

/**
 * Convert Python-style indentation-based blocks to brace-based blocks.
 *
 * Approach:
 *  1. Walk lines tracking the current indentation stack.
 *  2. When indentation increases after a colon-terminated header, open `{`.
 *  3. When indentation decreases, insert the appropriate number of `}` closings.
 *  4. Remove the trailing `:` from block-opening lines.
 */
export function convertIndentToBlocks(code: string): string {
  const lines = code.split('\n');
  const output: string[] = [];
  const indentStack: number[] = [0];

  // Patterns for lines that open a new block
  const BLOCK_OPENERS = /^\s*(def |class |if |elif |else|else if |for |while |try:|except|finally:|with )/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimEnd();

    if (trimmed === '') {
      output.push('');
      continue;
    }

    // Compute indent of current line
    const indent = trimmed.length - trimmed.trimStart().length;
    const currentIndent = indentStack[indentStack.length - 1];

    if (indent < currentIndent) {
      // Dedent: close blocks
      while (indentStack.length > 1 && indentStack[indentStack.length - 1] > indent) {
        indentStack.pop();
        const closingIndent = indentStack[indentStack.length - 1];
        output.push(' '.repeat(closingIndent) + '}');
      }
    }

    // Strip trailing colon on block-opening headers
    let outputLine = trimmed;
    if (trimmed.endsWith(':') && BLOCK_OPENERS.test(trimmed)) {
      outputLine = trimmed.slice(0, -1) + ' {';
      // Push new indentation level (we'll discover it from next line)
      const nextNonEmpty = lines.slice(i + 1).find((l) => l.trim() !== '');
      if (nextNonEmpty !== undefined) {
        const nextIndent = nextNonEmpty.length - nextNonEmpty.trimStart().length;
        if (nextIndent > indent) {
          indentStack.push(nextIndent);
        }
      }
    }

    output.push(' '.repeat(indent) + outputLine.trimStart());
  }

  // Close any remaining open blocks
  while (indentStack.length > 1) {
    indentStack.pop();
    const closingIndent = indentStack[indentStack.length - 1];
    output.push(' '.repeat(closingIndent) + '}');
  }

  return output.join('\n');
}

/**
 * Convert brace-based blocks to Python indentation.
 *
 * Approach:
 *  1. Track an indentation level (incremented for `{`, decremented for `}`).
 *  2. Strip trailing `{` from block-opening lines and add `:`.
 *  3. Remove standalone `}` lines.
 *  4. Remove trailing semicolons.
 */
export function convertBlocksToIndent(code: string, indentSize = 4): string {
  const lines = code.split('\n');
  const output: string[] = [];
  let depth = 0;

  for (const raw of lines) {
    let line = raw.trim();

    if (line === '') {
      output.push('');
      continue;
    }

    // Decrease depth before writing if line starts with `}`
    const startsWithClose = line.startsWith('}');
    if (startsWithClose) {
      depth = Math.max(0, depth - 1);
      // Strip the leading `}` and any surrounding whitespace
      line = line.replace(/^\}\s*/, '').trim();
    }

    // If the line is now empty after stripping `}`, skip it
    if (line === '') {
      continue;
    }

    // Remove trailing semicolons
    line = line.replace(/;$/, '');

    // Determine if this line opens a new block (`{` at end)
    const endsWithOpen = line.endsWith('{');
    if (endsWithOpen) {
      // Replace trailing `{` with `:`
      line = line.slice(0, -1).trimEnd() + ':';
    }

    const indent = ' '.repeat(depth * indentSize);
    output.push(indent + line);

    if (endsWithOpen) {
      depth++;
    }
  }

  return output.join('\n');
}

// ─── Warnings detection ───────────────────────────────────────────────────────

function detectUnsupported(code: string, sourceLang: Language, targetLang: Language): string[] {
  const warnings: string[] = [];

  if (sourceLang === 'python') {
    if (code.includes('lambda')) warnings.push('lambda expressions may need manual rewrite');
    if (code.includes('yield')) warnings.push('generators/yield require manual conversion');
    if (code.includes('@')) warnings.push('decorators require manual conversion');
    if (code.includes('__')) warnings.push('dunder methods may require manual mapping');
    if (code.includes('with ')) warnings.push('context managers (with) require manual conversion');
    if (code.includes('async') || code.includes('await')) warnings.push('async/await syntax differs between languages');
  }

  if (sourceLang === 'javascript' || sourceLang === 'typescript') {
    if (code.includes('=>')) warnings.push('arrow functions converted to regular functions where possible');
    if (code.includes('async') || code.includes('await')) warnings.push('async/await syntax differs between languages');
    if (code.includes('prototype')) warnings.push('prototype-based patterns require manual conversion');
    if (code.includes('Symbol(')) warnings.push('Symbol type has no direct equivalent');
  }

  if (sourceLang === 'java') {
    if (code.includes('interface ')) warnings.push('Java interfaces require manual conversion');
    if (code.includes('@Override') || code.includes('@SuppressWarnings')) warnings.push('Java annotations require manual mapping');
    if (code.includes('extends') || code.includes('implements')) warnings.push('inheritance hierarchy may need adjustment');
    if (code.includes('generics') || code.match(/<[A-Z]\w*>/)) warnings.push('generic types may require manual mapping');
  }

  if (sourceLang === 'cpp') {
    if (code.includes('::')) warnings.push('namespace/scope resolution may need adjustment');
    if (code.includes('*') || code.includes('&')) warnings.push('pointers and references require manual conversion');
    if (code.includes('template')) warnings.push('C++ templates require manual conversion');
    if (code.includes('#define')) warnings.push('preprocessor macros require manual conversion');
    if (code.includes('malloc') || code.includes('free')) warnings.push('manual memory management removed — not needed in target language');
  }

  if (targetLang === 'typescript') {
    warnings.push('Type annotations are placeholders — review and adjust types manually');
  }

  return warnings;
}

// ─── Function / class header transformation ───────────────────────────────────

function transformFunctionHeaders(code: string, sourceLang: Language, targetLang: Language): string {
  const lines = code.split('\n');

  if (sourceLang === 'python' && (targetLang === 'javascript' || targetLang === 'typescript')) {
    return lines
      .map((line) => {
        // def func(args): → function func(args) {  (handled by indent→block + rule)
        // But we also handle: def __init__(self, ...): → constructor(...) {
        const initMatch = line.match(/^(\s*)def\s+__init__\s*\(\s*self(?:,\s*)?([^)]*)\)\s*\{?\s*:?\s*\{?/);
        if (initMatch) {
          const [, indent, params] = initMatch;
          return `${indent}constructor(${params.trim()}) {`;
        }

        const defMatch = line.match(/^(\s*)def\s+(\w+)\s*\(\s*(?:self,?\s*)?([^)]*)\)\s*(?:\{|:)/);
        if (defMatch) {
          const [, indent, name, params] = defMatch;
          const cleanParams = params; // defaults are preserved as-is from the Python source
          if (targetLang === 'typescript') {
            const typedParams = cleanParams
              .split(',')
              .map((p) => p.trim())
              .filter(Boolean)
              .map((p) => (p.includes(':') ? p : `${p}: unknown`))
              .join(', ');
            return `${indent}${name}(${typedParams}): unknown {`;
          }
          return `${indent}${name}(${cleanParams}) {`;
        }

        // class X: → class X {
        const classMatch = line.match(/^(\s*)class\s+(\w+)(?:\s*\([^)]*\))?\s*(?:\{|:)/);
        if (classMatch) {
          const [, indent, name] = classMatch;
          return `${indent}class ${name} {`;
        }

        return line;
      })
      .join('\n');
  }

  if ((sourceLang === 'javascript' || sourceLang === 'typescript') && targetLang === 'python') {
    return lines
      .map((line) => {
        // function name(args) { → def name(args):
        const funcMatch = line.match(/^(\s*)(?:(?:async\s+)?function\s+(\w+)|(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?function)\s*\(([^)]*)\)\s*(?::\s*\w+)?\s*\{/);
        if (funcMatch) {
          const [, indent, name1, name2, params] = funcMatch;
          const name = name1 || name2;
          const cleanParams = params.replace(/:\s*\w+/g, '').replace(/\s+/g, ' ').trim();
          return `${indent}def ${name}(${cleanParams}):`;
        }

        // Arrow function const name = (args) => {
        const arrowMatch = line.match(/^(\s*)(?:const|let|var)\s+(\w+)\s*=\s*(?:async\s+)?\(([^)]*)\)\s*(?::\s*\w+)?\s*=>\s*\{/);
        if (arrowMatch) {
          const [, indent, name, params] = arrowMatch;
          const cleanParams = params.replace(/:\s*\w+/g, '').replace(/\s+/g, ' ').trim();
          return `${indent}def ${name}(${cleanParams}):`;
        }

        // class X { → class X:
        const classMatch = line.match(/^(\s*)class\s+(\w+)(?:\s+extends\s+\w+)?\s*\{/);
        if (classMatch) {
          const [, indent, name] = classMatch;
          return `${indent}class ${name}:`;
        }

        return line;
      })
      .join('\n');
  }

  if (sourceLang === 'python' && targetLang === 'java') {
    let lastClassName = 'Main';
    return lines
      .map((line) => {
        const classMatch = line.match(/^(\s*)class\s+(\w+)(?:\s*\([^)]*\))?\s*(?:\{|:)/);
        if (classMatch) {
          const [, indent, name] = classMatch;
          lastClassName = name;
          return `${indent}public class ${name} {`;
        }

        const defMatch = line.match(/^(\s*)def\s+(\w+)\s*\(\s*(?:self,?\s*)?([^)]*)\)\s*(?:\{|:)/);
        if (defMatch) {
          const [, indent, name, params] = defMatch;
          const cleanParams = params
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p) => `Object ${p.split('=')[0].trim()}`)
            .join(', ');
          if (name === '__init__') {
            return `${indent}public ${lastClassName}(${cleanParams}) {`;
          }
          return `${indent}public Object ${name}(${cleanParams}) {`;
        }

        return line;
      })
      .join('\n');
  }

  if (sourceLang === 'python' && targetLang === 'cpp') {
    return lines
      .map((line) => {
        const defMatch = line.match(/^(\s*)def\s+(\w+)\s*\(\s*(?:self,?\s*)?([^)]*)\)\s*(?:\{|:)/);
        if (defMatch) {
          const [, indent, name, params] = defMatch;
          const cleanParams = params
            .split(',')
            .map((p) => p.trim())
            .filter(Boolean)
            .map((p) => `auto ${p.split('=')[0].trim()}`)
            .join(', ');
          return `${indent}auto ${name}(${cleanParams}) {`;
        }

        const classMatch = line.match(/^(\s*)class\s+(\w+)(?:\s*\([^)]*\))?\s*(?:\{|:)/);
        if (classMatch) {
          const [, indent, name] = classMatch;
          return `${indent}class ${name} {`;
        }

        return line;
      })
      .join('\n');
  }

  return code;
}

// ─── Rule selector ────────────────────────────────────────────────────────────

function selectRules(sourceLang: Language, targetLang: Language): TranslationRule[] {
  const key = `${sourceLang}→${targetLang}`;
  switch (key) {
    case 'python→javascript': return pythonToJsRules;
    case 'python→typescript': return pythonToJsRules; // same base rules; TS-specific handled in engine
    case 'javascript→python': return jsToPythonRules;
    case 'typescript→python': return jsToPythonRules;
    case 'javascript→typescript': return jsToTsRules;
    case 'typescript→javascript': return tsToJsRules;
    case 'python→java': return pythonToJavaRules;
    case 'java→python': return javaToPythonRules;
    case 'python→cpp': return pythonToCppRules;
    case 'cpp→python': return cppToPythonRules;
    case 'java→cpp': return javaToCppRules;
    case 'cpp→java': return cppToJavaRules;
    default: return [];
  }
}

// ─── Main translate function ──────────────────────────────────────────────────

export function translate(request: TranslationRequest): TranslationResult {
  const { sourceCode, sourceLang, targetLang, runTests = true } = request;
  const warnings: string[] = [];

  if (sourceLang === targetLang) {
    return {
      translatedCode: sourceCode,
      warnings: ['Source and target languages are the same — no translation performed.'],
      unsupportedFeatures: [],
      testResults: [],
    };
  }

  const rules = selectRules(sourceLang, targetLang);
  if (rules.length === 0) {
    return {
      translatedCode: sourceCode,
      warnings: [`Translation from ${sourceLang} to ${targetLang} is not yet supported.`],
      unsupportedFeatures: [`${sourceLang} → ${targetLang}`],
      testResults: [],
    };
  }

  // Detect unsupported features before translation
  const unsupportedFeatures = detectUnsupported(sourceCode, sourceLang, targetLang);

  let code = sourceCode;

  // ── Step 1: Pre-process — transform function/class headers ──────────────────
  if (sourceLang === 'python') {
    // Convert indentation to braces first so subsequent rules see `{`
    code = convertIndentToBlocks(code);
  }

  // ── Step 2: Transform function/class headers ─────────────────────────────────
  code = transformFunctionHeaders(code, sourceLang, targetLang);

  // ── Step 3: Apply token-level rules ──────────────────────────────────────────
  code = applyRules(code, rules);

  // ── Step 4: Post-process block structure ─────────────────────────────────────
  if (targetLang === 'python') {
    // Source was brace-based → convert to indentation
    code = convertBlocksToIndent(code);
  }

  // ── Step 5: TypeScript extras — add `export` and interface skeleton ──────────
  if (targetLang === 'typescript' && sourceLang !== 'typescript') {
    // Prefix top-level function declarations with `export`
    code = code.replace(/^(function\s+\w+)/gm, 'export $1');
    // Prefix top-level class declarations with `export`
    code = code.replace(/^(class\s+\w+)/gm, 'export $1');
  }

  // ── Step 6: C++ extras — add includes ────────────────────────────────────────
  if (targetLang === 'cpp') {
    const includes = ['#include <iostream>', '#include <string>', '#include <vector>', '#include <cmath>'].join('\n');
    code = includes + '\n\n' + code;
    warnings.push('Standard C++ headers added — review and remove unused ones.');
  }

  // ── Step 7: Java extras — wrap in class if missing ───────────────────────────
  if (targetLang === 'java' && !code.includes('public class') && !code.includes('class ')) {
    code = 'public class Main {\n' + code.split('\n').map((l) => '    ' + l).join('\n') + '\n}';
    warnings.push('Code wrapped in `public class Main` — rename as appropriate.');
  }

  // ── Run built-in tests ────────────────────────────────────────────────────────
  let testResults: Array<{ id: string; description: string; passed: boolean; reason?: string }> = [];
  if (runTests) {
    testResults = runBuiltInTests(sourceLang, targetLang);
  }

  return {
    translatedCode: code,
    warnings: [...warnings, ...unsupportedFeatures.slice(0, 3).map((f) => `Unsupported: ${f}`)],
    unsupportedFeatures,
    testResults,
  };
}

// ─── Built-in test runner ─────────────────────────────────────────────────────

function runBuiltInTests(
  sourceLang: Language,
  targetLang: Language,
): Array<{ id: string; description: string; passed: boolean; reason?: string }> {
  const cases = getTestCases().filter(
    (tc) => tc.sourceLang === sourceLang && tc.targetLang === targetLang,
  );

  return cases.map((tc) => {
    const result = translate({
      sourceCode: tc.sourceCode,
      sourceLang: tc.sourceLang,
      targetLang: tc.targetLang,
      runTests: false, // avoid infinite recursion
    });

    const translated = result.translatedCode;
    const pattern = tc.expectedPattern;
    let passed: boolean;
    let reason: string | undefined;

    if (pattern instanceof RegExp) {
      passed = pattern.test(translated);
      if (!passed) reason = `Expected to match ${pattern.toString()} but got:\n${translated}`;
    } else {
      passed = translated.includes(pattern);
      if (!passed) reason = `Expected to find "${pattern}" in:\n${translated}`;
    }

    return { id: tc.id, description: tc.description, passed, reason };
  });
}
