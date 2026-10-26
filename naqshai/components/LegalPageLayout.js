import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';

export default function LegalPageLayout({ title, description, lastUpdated = '26 October 2026', children }) {
  return (
    <div className="min-h-screen bg-page text-ink flex flex-col justify-between">
      <div>
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
            <p className="mt-3 text-xs text-muted">Last updated: {lastUpdated}</p>
          </div>

          <article className="ui-panel space-y-8 p-5 sm:p-8">
            {children}
          </article>
        </main>
      </div>

      <footer className="mt-auto border-t border-border bg-surface px-4 py-8 text-center text-xs text-muted">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 NAQSHAI. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            <Link href="/privacy-policy" className="hover:text-action-hover font-medium">Privacy policy</Link>
            <Link href="/terms-and-conditions" className="hover:text-action-hover">Terms and conditions</Link>
            <Link href="/" className="hover:text-action-hover">Home</Link>
            <a
              href="mailto:team.naqshai@gmail.com"
              className="inline-flex items-center gap-1.5 text-action-hover hover:underline"
            >
              <Mail aria-hidden="true" className="h-3.5 w-3.5" />
              <span>team.naqshai@gmail.com</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
