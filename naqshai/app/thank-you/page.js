import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export const metadata = {
  title: 'Thank You | NAQSHAI',
  description: 'Your NAQSHAI plot listing has been submitted for verification.',
};

export default async function ThankYouPage({ searchParams }) {
  const { type } = await searchParams;
  const listingSubmitted = type === 'listing';

  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-4 py-12 text-ink">
      <section className="ui-panel w-full max-w-xl p-6 text-center shadow-raised sm:p-10">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-emerald-300 bg-emerald-50 text-action-hover">
          <CheckCircle2 aria-hidden="true" className="h-9 w-9" />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-action-hover">NAQSHAI</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          {listingSubmitted ? 'Thank you for your submission' : 'Thank you for choosing NAQSHAI'}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">
          {listingSubmitted
            ? 'Your plot listing has been received and is under review. It is not public yet; once verified, it can be published to the 3D Map. You can track its status from My Listings.'
            : 'We appreciate you being here. Explore verified plot information and geospatial insights to help with your property search.'}
        </p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          {listingSubmitted ? (
            <Link href="/dashboard" className="ui-button-primary ui-focus-ring">
              View My Listings
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          ) : (
            <Link href="/explore" className="ui-button-primary ui-focus-ring">
              Explore the 3D Map
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          )}
          <Link href="/" className="ui-button-secondary ui-focus-ring">Back to home</Link>
        </div>
      </section>
    </main>
  );
}
