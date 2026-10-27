/**
 * Robots.txt configuration for NAQSHAI
 * Instructs search engines to crawl public portal pages while strictly disallowing
 * internal operator review routes and private API endpoints.
 */
export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://naqshaii.vercel.app';
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/review', '/review/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
