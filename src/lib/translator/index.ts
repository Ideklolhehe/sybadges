/**
 * Public API for the code translation engine.
 */

export { translate, applyRules, convertIndentToBlocks, convertBlocksToIndent } from './engine';
export { getTestCases } from './tests';
export type { Language, TranslationRule, TranslationRequest, TranslationResult, TestCase, TestResult } from './types';
export { LANGUAGE_LABELS } from './types';
