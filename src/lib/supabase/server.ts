/**
 * Server-side Supabase client.
 * Used in Server Components, Route Handlers, and Server Actions.
 * Handles cookies via Next.js's cookies() API.
 */
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
    const cookieStore = await cookies();

  return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
            cookies: {
                      getAll() {
                                  return cookieStore.getAll();
                      },
                      setAll(
                                  cookiesToSet: { name: string; value: string; options?: CookieOptions }[]
                                ) {
                                  try {
                                                cookiesToSet.forEach(({ name, value, options }) =>
                                                                cookieStore.set(name, value, options)
                                                                                 );
                                  } catch {
                                                // Server Component context - cookies can't be set here.
                                    // The middleware will refresh them on the next request.
                                  }
                      },
            },
    }
      );
}
