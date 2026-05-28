import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function GET() {
  const product = await stripe.products.create({ name: 'BYKAH Plus' });
  const monthly = await stripe.prices.create({
    product: product.id,
    unit_amount: 900,
    currency: 'usd',
    recurring: { interval: 'month' },
  });
  const annual = await stripe.prices.create({
    product: product.id,
    unit_amount: 8500,
    currency: 'usd',
    recurring: { interval: 'year' },
  });
  return NextResponse.json({ productId: product.id, monthlyPriceId: monthly.id, annualPriceId: annual.id });
}
