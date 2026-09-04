import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/explore';
  const errorParam = requestUrl.searchParams.get('error_description') || requestUrl.searchParams.get('error');

  // Prevent open redirect vulnerabilities by ensuring next is a relative path
  const isValidRedirect = next.startsWith('/') && !next.startsWith('//');
  const safeNext = isValidRedirect ? next : '/explore';

  if (errorParam) {
    console.error('[auth/callback] OAuth provider error param:', errorParam);
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorParam)}`, request.url)
    );
  }

  if (code) {
    const cookieStore = await cookies();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[auth/callback] Supabase credentials missing');
      return NextResponse.redirect(
        new URL('/login?error=Supabase%20credentials%20missing', request.url)
      );
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (err) {
            // setAll may throw if invoked in Server Component context; ignore gracefully
          }
        },
      },
    });

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[auth/callback] AuthApiError exchanging code for session:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });

      // Fallback: Check if a valid session already exists despite exchange error
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session) {
        console.log('[auth/callback] Active session verified, proceeding to:', safeNext);
        return NextResponse.redirect(new URL(safeNext, request.url));
      }

      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url)
      );
    }
  }

  return NextResponse.redirect(new URL(safeNext, request.url));
}
