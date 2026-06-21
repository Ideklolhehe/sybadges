import { notFound } from 'next/navigation';

/**
 * Development-only guard for the Code Translator tool.
 *
 * The translator is intentionally excluded from the published web app.
 * Set ENABLE_CODE_TRANSLATOR=true in your .env.local to enable it locally.
 */
export default function TranslatorLayout({ children }: { children: React.ReactNode }) {
  if (process.env.ENABLE_CODE_TRANSLATOR !== 'true') {
    notFound();
  }

  return <>{children}</>;
}
