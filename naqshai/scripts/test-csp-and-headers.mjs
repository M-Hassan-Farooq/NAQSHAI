/**
 * Automated Verification Suite: Content Security Policy & Perimeter HTTP Defense
 * 
 * Verifies that next.config.mjs enforces:
 * - Content-Security-Policy (CSP) with complete coverage for Next.js, Google Maps, and Supabase
 * - Frame ancestor lockdown ('none') to eliminate Clickjacking
 * - Object-src lockdown ('none') to block vulnerable plugins
 * - X-Content-Type-Options: nosniff
 * - X-Frame-Options: DENY
 * - Strict-Transport-Security (HSTS) with 2-year duration, subdomains, and preload
 * - Referrer-Policy: strict-origin-when-cross-origin
 * - Permissions-Policy with microphone=(self) for voice assistant, camera=(), geolocation=(), etc.
 * - Cross-Origin-Opener-Policy: same-origin-allow-popups
 * - Server fingerprint suppression (poweredByHeader: false)
 */

import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCspTests() {
  console.log('================================================================');
  console.log('   NAQSHAI CONTENT SECURITY POLICY & HEADER VERIFICATION SUITE   ');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`  ✓ ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      throw new Error(`Test assertion failed: ${message}`);
    }
  }

  // Load next.config.mjs with cross-platform file URL
  const configPath = path.resolve(__dirname, '../next.config.mjs');
  const nextConfigModule = await import(pathToFileURL(configPath).href);
  const nextConfig = nextConfigModule.default;

  console.log('[TEST GROUP 1] Next.js Configuration Hardening');
  assert(nextConfig !== null && typeof nextConfig === 'object', 'nextConfig is exported properly');
  assert(nextConfig.poweredByHeader === false, 'poweredByHeader is disabled to suppress X-Powered-By server fingerprinting');
  assert(typeof nextConfig.headers === 'function', 'headers() async function is implemented');

  const headersList = await nextConfig.headers();
  assert(Array.isArray(headersList) && headersList.length > 0, 'headers() returns route configurations');

  const globalRule = headersList.find(r => r.source === '/(.*)');
  assert(Boolean(globalRule), 'Global route pattern "/(.*)" exists for site-wide protection');

  const headerMap = {};
  for (const h of globalRule.headers) {
    headerMap[h.key] = h.value;
  }

  console.log('\n[TEST GROUP 2] HTTP Security Perimeter Defense Headers');
  assert(headerMap['X-Content-Type-Options'] === 'nosniff', 'X-Content-Type-Options is "nosniff"');
  assert(headerMap['X-Frame-Options'] === 'DENY', 'X-Frame-Options is "DENY"');
  assert(headerMap['X-DNS-Prefetch-Control'] === 'on', 'X-DNS-Prefetch-Control is "on"');
  assert(headerMap['Referrer-Policy'] === 'strict-origin-when-cross-origin', 'Referrer-Policy is "strict-origin-when-cross-origin"');
  assert(headerMap['Cross-Origin-Opener-Policy'] === 'same-origin-allow-popups', 'COOP is "same-origin-allow-popups" for safe external links/auth');

  const hsts = headerMap['Strict-Transport-Security'] || '';
  assert(hsts.includes('max-age=63072000'), 'HSTS enforces 2-year duration (63,072,000s)');
  assert(hsts.includes('includeSubDomains'), 'HSTS enforces includeSubDomains');
  assert(hsts.includes('preload'), 'HSTS enforces browser preload list eligibility');

  console.log('\n[TEST GROUP 3] Permissions-Policy Hardware Isolation');
  const perm = headerMap['Permissions-Policy'] || '';
  assert(perm.includes('microphone=(self)'), 'Microphone granted to same-origin for AI Voice Assistant');
  assert(perm.includes('camera=()'), 'Camera hardware disabled');
  assert(perm.includes('geolocation=()'), 'Geolocation API blocked from malicious scripts');
  assert(perm.includes('payment=()'), 'Payment API disabled');
  assert(perm.includes('usb=()'), 'USB interface disabled');
  assert(perm.includes('browsing-topics=()'), 'Ad tracking / browsing-topics disabled');

  console.log('\n[TEST GROUP 4] Content Security Policy (CSP) Directives');
  const csp = headerMap['Content-Security-Policy'] || '';
  assert(csp.length > 0, 'Content-Security-Policy header is populated');

  // Directives test
  assert(csp.includes("default-src 'self'"), "default-src is constrained to 'self'");
  assert(csp.includes("object-src 'none'"), "object-src is 'none' (blocks Flash, Java, plugins)");
  assert(csp.includes("base-uri 'self'"), "base-uri is 'self' (prevents base tag hijacking)");
  assert(csp.includes("frame-ancestors 'none'"), "frame-ancestors is 'none' (eliminates Clickjacking)");
  assert(csp.includes("upgrade-insecure-requests"), "upgrade-insecure-requests is active");

  // Google Maps support
  assert(csp.includes('https://maps.googleapis.com'), 'Google Maps JS API authorized');
  assert(csp.includes('https://*.googleapis.com'), 'Google APIs subdomains authorized');
  assert(csp.includes('https://maps.gstatic.com'), 'Google Maps static assets authorized');
  assert(csp.includes('https://fonts.gstatic.com'), 'Google Fonts assets authorized');
  assert(csp.includes('https://*.ggpht.com'), 'Google Photos / StreetView tiles authorized');

  // Supabase support
  assert(csp.includes('https://*.supabase.co'), 'Supabase DB / Auth / Storage endpoints authorized');
  assert(csp.includes('wss://*.supabase.co'), 'Supabase Realtime WebSockets authorized');

  // Worker & Blob support for map vector rendering & document preview
  assert(csp.includes("worker-src 'self' blob:"), 'Web workers permitted for Google Maps 3D vector rendering');
  assert(csp.includes("frame-src 'self' blob: data:"), 'PDF document preview frames permitted');

  console.log('\n================================================================');
  console.log(`TOTAL TESTS:  ${total}`);
  console.log(`PASSED:       ${passed}`);
  console.log(`FAILED:       ${total - passed}`);
  console.log(`SUCCESS RATE: ${Math.round((passed / total) * 100)}%`);
  console.log('================================================================\n');
}

runCspTests().catch((err) => {
  console.error('\nCSP Test Suite Failed:', err);
  process.exit(1);
});
