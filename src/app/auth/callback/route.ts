/**
 * Supabase auth callback handler.
 * After a user clicks a confirmation link, password reset link, or magic link,
 * Supabase redirects to this URL with a code. We exchange the code for a session.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Code missing or exchange failed — send them back to login with an error flag
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
