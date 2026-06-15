import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

// Map plan keys to server-side env vars — price IDs never leave the server
const PRICE_IDS: Record<string, string | undefined> = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
  pro_annual: process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  ultimate_monthly: process.env.STRIPE_ULTIMATE_MONTHLY_PRICE_ID,
  ultimate_annual: process.env.STRIPE_ULTIMATE_ANNUAL_PRICE_ID,
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { plan } = await req.json();
    const priceId = PRICE_IDS[plan];

    if (!priceId) {
      console.error(`No price ID configured for plan: ${plan}`);
      return NextResponse.json(
        { error: `No price configured for plan "${plan}". Check Vercel env vars.` },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard?upgraded=1',
      cancel_url: process.env.NEXT_PUBLIC_APP_URL + '/dashboard/upgrade',
      customer_email: user.email,
      metadata: { userId: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout error:', err);
    const message = err instanceof Error ? err.message : 'Checkout session creation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
