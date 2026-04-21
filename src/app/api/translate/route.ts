import { NextRequest, NextResponse } from 'next/server';
import { translate } from '@/lib/translator';
import type { Language } from '@/lib/translator';

/**
 * The Code Translator is a development-only tool and is excluded from the
 * published web app.  Set ENABLE_CODE_TRANSLATOR=true in .env.local to use it.
 */
const TRANSLATOR_ENABLED = process.env.ENABLE_CODE_TRANSLATOR === 'true';

const SUPPORTED_LANGUAGES: Language[] = ['python', 'javascript', 'typescript', 'java', 'cpp'];

export async function POST(request: NextRequest) {
  if (!TRANSLATOR_ENABLED) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { sourceCode, sourceLang, targetLang, runTests } = body;

    // Validate required fields
    if (!sourceCode || typeof sourceCode !== 'string') {
      return NextResponse.json(
        { error: 'sourceCode is required and must be a string' },
        { status: 400 },
      );
    }

    if (!sourceLang || !SUPPORTED_LANGUAGES.includes(sourceLang as Language)) {
      return NextResponse.json(
        { error: `sourceLang must be one of: ${SUPPORTED_LANGUAGES.join(', ')}` },
        { status: 400 },
      );
    }

    if (!targetLang || !SUPPORTED_LANGUAGES.includes(targetLang as Language)) {
      return NextResponse.json(
        { error: `targetLang must be one of: ${SUPPORTED_LANGUAGES.join(', ')}` },
        { status: 400 },
      );
    }

    if (sourceCode.length > 50_000) {
      return NextResponse.json(
        { error: 'sourceCode must not exceed 50,000 characters' },
        { status: 400 },
      );
    }

    const result = translate({
      sourceCode,
      sourceLang: sourceLang as Language,
      targetLang: targetLang as Language,
      runTests: runTests !== false,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Internal server error during translation' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/translate — returns metadata about supported languages and pairs.
 */
export async function GET() {
  if (!TRANSLATOR_ENABLED) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json({
    supportedLanguages: SUPPORTED_LANGUAGES,
    supportedPairs: [
      'python→javascript',
      'python→typescript',
      'python→java',
      'python→cpp',
      'javascript→python',
      'javascript→typescript',
      'typescript→python',
      'typescript→javascript',
      'java→python',
      'java→cpp',
      'cpp→python',
      'cpp→java',
    ],
  });
}
