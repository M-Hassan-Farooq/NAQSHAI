import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function LegalPageLayout({ title, description, children }) {
  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-sm font-bold tracking-tight text-ink ui-focus-ring rounded-control">
            NAQSHAI
          </Link>
          <Link href="/" className="ui-button-secondary ui-focus-ring text-sm">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8 max-w-3xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-action-hover">
            NAQSHAI · Legal
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted">{description}</p>
          <p className="mt-3 text-xs text-muted">Last updated: 25 October 2026</p>
        </div>

        <article className="ui-panel space-y-8 p-5 sm:p-8">
          {children}
        </article>
      </main>

      <footer className="border-t border-border bg-surface px-4 py-6 text-center text-xs text-muted">
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
          <Link href="/privacy-policy" className="hover:text-action-hover">Privacy policy</Link>
          <Link href="/terms-and-conditions" className="hover:text-action-hover">Terms and conditions</Link>
          <Link href="/" className="hover:text-action-hover">NAQSHAI home</Link>
        </div>
      </footer>
    </div>
  );
}
