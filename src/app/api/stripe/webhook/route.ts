import Stripe from 'stripe';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

const PRO_PRICE_IDS = [
    process.env.STRIPE_PRO_MONTHLY_PRICE_ID,
    process.env.STRIPE_PRO_ANNUAL_PRICE_ID,
  ].filter(Boolean) as string[];

function getPlanFromPriceId(priceId: string): 'plus' | 'pro' {
    return PRO_PRICE_IDS.includes(priceId) ? 'pro' : 'plus';
}

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;
    try {
          event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch {
          return NextResponse.json({ error: 'Webhook signature failed' }, { status: 400 });
    }

  const supabase = await createClient();

  if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        if (userId && session.subscription) {
                // Retrieve subscription to determine which plan was purchased
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
                const priceId = subscription.items.data[0]?.price.id ?? '';
                const plan = getPlanFromPriceId(priceId);
                await supabase.from('profiles').upsert({
                          id: userId,
                          plan,
                          stripe_customer_id: session.customer as string,
                          stripe_subscription_id: session.subscription as string,
                });
        }
  }

  if (event.type === 'customer.subscription.updated') {
        const sub = event.data.object as Stripe.Subscription;
        const priceId = sub.items.data[0]?.price.id ?? '';
        const plan = getPlanFromPriceId(priceId);
        const isActive = sub.status === 'active' || sub.status === 'trialing';
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_subscription_id', sub.id);
        if (profiles?.length) {
                await supabase
                  .from('profiles')
                  .update({ plan: isActive ? plan : 'free' })
                  .eq('id', profiles[0].id);
        }
  }

  if (event.type === 'customer.subscription.deleted') {
        const sub = event.data.object as Stripe.Subscription;
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id')
          .eq('stripe_subscription_id', sub.id);
        if (profiles?.length) {
                await supabase
                  .from('profiles')
                  .update({ plan: 'free', stripe_subscription_id: null })
                  .eq('id', profiles[0].id);
        }
  }

  return NextResponse.json({ received: true });
}
