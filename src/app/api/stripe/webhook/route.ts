import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 });
  }

  const supabase = createClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (userId) {
      await supabase.from('profiles').upsert({
        id: userId,
        plan: 'plus',
        stripe_customer_id: session.customer as string,
        stripe_subscription_id: session.subscription as string,
      });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_subscription_id', sub.id);
    if (profiles?.length) {
      await supabase.from('profiles').update({ plan: 'free', stripe_subscription_id: null }).eq('id', profiles[0].id);
    }
  }

  return NextResponse.json({ received: true });
}

export const config = { api: { bodyParser: false } };
