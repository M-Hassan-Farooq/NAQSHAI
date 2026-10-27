/**
 * NAQSHAI Review Console Layout
 *
 * Configures strict search engine crawler directives:
 * - robots: noindex, nofollow, nocache, noarchive
 * Prevents search engines and web archivers from indexing or exposing this internal portal.
 */
export const metadata = {
  title: 'NAQSHAI Operator Verification Console',
  description: 'Internal verification portal for Twin Cities land listings.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function ReviewLayout({ children }) {
  return children;
}
