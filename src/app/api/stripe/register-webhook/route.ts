import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function GET() {
  const webhookEndpoint = await stripe.webhookEndpoints.create({
    url: 'https://bykah-app.vercel.app/api/stripe/webhook',
    enabled_events: [
      'checkout.session.completed',
      'customer.subscription.updated',
      'customer.subscription.deleted',
    ],
  });
  return NextResponse.json({
    id: webhookEndpoint.id,
    secret: webhookEndpoint.secret,
  });
}
