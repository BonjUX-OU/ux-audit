// app/api/checkout/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil", // or latest supported version
});

export async function POST(req: Request) {
  try {
    const { reportId, userId } = await req.json();

    // Here you can fetch product details from your DB if needed
    // e.g. const product = await db.products.findOne(productId);

    //https://uxmust.com/report/68b1e660a20be889f6e25cce/edit

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: "price_1S1xKzGdJIInQY0MVMGuY5EQ",
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment?report=${reportId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
      metadata: {
        reportId,
        userId,
      },
    });

    if (session.url) {
      return NextResponse.redirect(session.url, 303);
    } else {
      throw new Error("No session URL");
    }
  } catch (err: any) {
    console.error("Stripe checkout session error:", err.message);
    return new NextResponse("Error creating checkout session", { status: 500 });
  }
}
