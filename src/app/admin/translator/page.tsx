'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code2, ArrowRight, Play, RotateCcw, Copy, Check, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { Language, TranslationResult } from '@/lib/translator/types'
import { LANGUAGE_LABELS } from '@/lib/translator/types'

// ─── Language options ─────────────────────────────────────────────────────────

const LANGUAGES: Language[] = ['python', 'javascript', 'typescript', 'java', 'cpp']

const LANGUAGE_EXTENSIONS: Record<Language, string> = {
  python: 'py',
  javascript: 'js',
  typescript: 'ts',
  java: 'java',
  cpp: 'cpp',
}

// ─── Placeholder examples ─────────────────────────────────────────────────────

const EXAMPLES: Partial<Record<Language, string>> = {
  python: `def greet(name):
    message = f"Hello, {name}!"
    print(message)
    return message

class Counter:
    def __init__(self, start=0):
        self.count = start

    def increment(self):
        self.count += 1
        return self.count

    def reset(self):
        self.count = 0

# Main execution
counter = Counter()
for i in range(5):
    print(counter.increment())

names = ["Alice", "Bob", "Charlie"]
for name in names:
    greet(name)`,

  javascript: `function greet(name) {
    const message = \`Hello, \${name}!\`;
    console.log(message);
    return message;
}

class Counter {
    constructor(start = 0) {
        this.count = start;
    }

    increment() {
        this.count += 1;
        return this.count;
    }

    reset() {
        this.count = 0;
    }
}

// Main execution
const counter = new Counter();
for (let i = 0; i < 5; i++) {
    console.log(counter.increment());
}

const names = ["Alice", "Bob", "Charlie"];
for (const name of names) {
    greet(name);
}`,

  java: `public class Main {
    public static String greet(String name) {
        String message = "Hello, " + name + "!";
        System.out.println(message);
        return message;
    }

    public static void main(String[] args) {
        String[] names = {"Alice", "Bob", "Charlie"};
        for (String name : names) {
            greet(name);
        }
    }
}`,

  cpp: `#include <iostream>
#include <string>
#include <vector>

std::string greet(const std::string& name) {
    std::string message = "Hello, " + name + "!";
    std::cout << message << std::endl;
    return message;
}

int main() {
    std::vector<std::string> names = {"Alice", "Bob", "Charlie"};
    for (const auto& name : names) {
        greet(name);
    }
    return 0;
}`,
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TranslatorPage() {
  const [sourceLang, setSourceLang] = useState<Language>('python')
  const [targetLang, setTargetLang] = useState<Language>('javascript')
  const [sourceCode, setSourceCode] = useState(EXAMPLES.python ?? '')
  const [result, setResult] = useState<TranslationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [showTests, setShowTests] = useState(true)
  const [runTests, setRunTests] = useState(true)

  // ── Swap languages ──────────────────────────────────────────────────────────
  const swapLanguages = useCallback(() => {
    setSourceLang(targetLang)
    setTargetLang(sourceLang)
    setResult(null)
    setError(null)
  }, [sourceLang, targetLang])

  // ── Load example ────────────────────────────────────────────────────────────
  const loadExample = useCallback((lang: Language) => {
    if (EXAMPLES[lang]) {
      setSourceCode(EXAMPLES[lang]!)
      setResult(null)
      setError(null)
    }
  }, [])

  // ── Translate ────────────────────────────────────────────────────────────────
  const handleTranslate = async () => {
    if (!sourceCode.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceCode, sourceLang, targetLang, runTests }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error ?? 'Translation failed')
      } else {
        setResult(data as TranslationResult)
      }
    } catch {
      setError('Network error — please try again')
    } finally {
      setLoading(false)
    }
  }

  // ── Copy to clipboard ───────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!result) return
    await navigator.clipboard.writeText(result.translatedCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSourceCode(EXAMPLES[sourceLang] ?? '')
    setResult(null)
    setError(null)
  }

  const passedTests = result?.testResults.filter((t) => t.passed).length ?? 0
  const totalTests = result?.testResults.length ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#2E2973] rounded-xl flex items-center justify-center">
          <Code2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Code Translator</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Translate code between programming languages with syntax integrity and logic consistency
          </p>
        </div>
      </div>

      {/* Language selector bar */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Source language */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Source Language</label>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setSourceLang(lang); setResult(null); loadExample(lang) }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    sourceLang === lang
                      ? 'bg-[#2E2973] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Swap button */}
          <button
            onClick={swapLanguages}
            className="mt-5 p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-[#2E2973] hover:text-white text-gray-600 dark:text-gray-400 transition-all group"
            title="Swap languages"
          >
            <ArrowRight className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>

          {/* Target language */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Target Language</label>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => { setTargetLang(lang); setResult(null) }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    targetLang === lang
                      ? 'bg-[#E04511] text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              ))}
            </div>
          </div>

          {/* Options + actions */}
          <div className="ml-auto flex items-end gap-2">
            <label className="flex items-center gap-2 cursor-pointer mt-5">
              <input
                type="checkbox"
                checked={runTests}
                onChange={(e) => setRunTests(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#2E2973] accent-[#2E2973]"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">Run tests</span>
            </label>
            <button
              onClick={handleReset}
              className="mt-5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleTranslate}
              disabled={loading || !sourceCode.trim() || sourceLang === targetLang}
              className="mt-5 flex items-center gap-2 px-5 py-1.5 bg-[#2E2973] text-white rounded-lg text-sm font-medium hover:bg-[#25206a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4" />
              {loading ? 'Translating…' : 'Translate'}
            </button>
          </div>
        </div>

        {sourceLang === targetLang && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Source and target languages must be different.
          </p>
        )}
      </div>

      {/* Editor area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Source code */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2E2973]" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {LANGUAGE_LABELS[sourceLang]} <span className="text-gray-400 font-normal">.{LANGUAGE_EXTENSIONS[sourceLang]}</span>
              </span>
            </div>
            <span className="text-xs text-gray-400">{sourceCode.split('\n').length} lines</span>
          </div>
          <textarea
            value={sourceCode}
            onChange={(e) => { setSourceCode(e.target.value); setResult(null) }}
            placeholder={`Paste your ${LANGUAGE_LABELS[sourceLang]} code here…`}
            className="flex-1 p-4 font-mono text-sm bg-transparent text-gray-900 dark:text-gray-100 resize-none focus:outline-none min-h-[400px]"
            spellCheck={false}
          />
        </div>

        {/* Translated code */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E04511]" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {LANGUAGE_LABELS[targetLang]} <span className="text-gray-400 font-normal">.{LANGUAGE_EXTENSIONS[targetLang]}</span>
              </span>
            </div>
            {result && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>

          <div className="flex-1 min-h-[400px] relative">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 z-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-2 border-[#2E2973] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-gray-500">Translating…</span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 flex items-start gap-2 text-red-600 dark:text-red-400">
                <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {!loading && !error && result && (
              <pre className="p-4 font-mono text-sm text-gray-900 dark:text-gray-100 overflow-auto h-full whitespace-pre-wrap">
                {result.translatedCode}
              </pre>
            )}

            {!loading && !error && !result && (
              <div className="h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                <div className="text-center space-y-2">
                  <Code2 className="w-12 h-12 mx-auto opacity-30" />
                  <p className="text-sm">Translation will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Warnings / Unsupported features */}
      <AnimatePresence>
        {result && result.warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                Translation Notes ({result.warnings.length})
              </h3>
            </div>
            <ul className="space-y-1">
              {result.warnings.map((w, i) => (
                <li key={i} className="text-xs text-amber-700 dark:text-amber-400 flex items-start gap-1.5">
                  <span className="mt-0.5">•</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Test Results */}
      <AnimatePresence>
        {result && result.testResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Test header */}
            <button
              onClick={() => setShowTests(!showTests)}
              className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${passedTests === totalTests ? 'bg-green-500' : 'bg-amber-500'}`} />
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Built-in Test Suite
                </h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  passedTests === totalTests
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                }`}>
                  {passedTests}/{totalTests} passed
                </span>
              </div>
              {showTests ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>

            <AnimatePresence>
              {showTests && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  {/* Progress bar */}
                  <div className="px-5 pb-3">
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${totalTests > 0 ? (passedTests / totalTests) * 100 : 0}%` }}
                        className="h-full bg-green-500 rounded-full"
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                  </div>

                  {/* Test list */}
                  <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-700 max-h-72 overflow-y-auto">
                    {result.testResults.map((test) => (
                      <div
                        key={test.id}
                        className={`flex items-start gap-3 px-5 py-2.5 ${
                          test.passed
                            ? 'bg-white dark:bg-gray-800'
                            : 'bg-red-50 dark:bg-red-900/10'
                        }`}
                      >
                        {test.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                            {test.description}
                          </p>
                          {!test.passed && test.reason && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5 line-clamp-2">
                              {test.reason}
                            </p>
                          )}
                        </div>
                        <span className={`text-xs font-medium shrink-0 ${test.passed ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {test.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
