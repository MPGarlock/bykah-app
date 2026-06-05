import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function GET() {
    // Plus product - $9/mo or $85/yr
  const plusProduct = await stripe.products.create({ name: 'BYKAH Plus' });
    const plusMonthly = await stripe.prices.create({
          product: plusProduct.id,
          unit_amount: 900,
          currency: 'usd',
          recurring: { interval: 'month' },
    });
    const plusAnnual = await stripe.prices.create({
          product: plusProduct.id,
          unit_amount: 8500,
          currency: 'usd',
          recurring: { interval: 'year' },
    });

  // Pro product - $15/mo or $144/yr
  const proProduct = await stripe.products.create({ name: 'BYKAH Pro' });
    const proMonthly = await stripe.prices.create({
          product: proProduct.id,
          unit_amount: 1500,
          currency: 'usd',
          recurring: { interval: 'month' },
    });
    const proAnnual = await stripe.prices.create({
          product: proProduct.id,
          unit_amount: 14400,
          currency: 'usd',
          recurring: { interval: 'year' },
    });

  return NextResponse.json({
        plus: {
                productId: plusProduct.id,
                monthlyPriceId: plusMonthly.id,
                annualPriceId: plusAnnual.id,
        },
        pro: {
                productId: proProduct.id,
                monthlyPriceId: proMonthly.id,
                annualPriceId: proAnnual.id,
        },
  });
}
