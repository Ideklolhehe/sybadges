// ─── Supported languages ────────────────────────────────────────────────────

export type Language = 'python' | 'javascript' | 'typescript' | 'java' | 'cpp';

export const LANGUAGE_LABELS: Record<Language, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  java: 'Java',
  cpp: 'C++',
};

// ─── Translation rule ────────────────────────────────────────────────────────

export interface TranslationRule {
  /** Human-readable description used in warnings / debug output */
  description: string;
  /**
   * Pattern to match.  May be a RegExp (applied per-line) or a function that
   * receives the entire code string and returns the (possibly modified) string.
   */
  pattern: RegExp;
  /** Replacement string or function (same semantics as String.prototype.replace) */
  replacement: string | ((...args: string[]) => string);
}

// ─── Built-in test case ───────────────────────────────────────────────────────

export interface TestCase {
  id: string;
  description: string;
  sourceLang: Language;
  targetLang: Language;
  sourceCode: string;
  /** A substring or exact match expected to appear in the translated output */
  expectedPattern: string | RegExp;
}

export interface TestResult {
  id: string;
  description: string;
  passed: boolean;
  reason?: string;
}

// ─── Translation request / response ──────────────────────────────────────────

export interface TranslationRequest {
  sourceCode: string;
  sourceLang: Language;
  targetLang: Language;
  /** Run built-in test suite after translation */
  runTests?: boolean;
}

export interface TranslationResult {
  translatedCode: string;
  warnings: string[];
  unsupportedFeatures: string[];
  testResults: TestResult[];
}
