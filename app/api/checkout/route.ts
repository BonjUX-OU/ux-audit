// app/api/checkout/route.ts
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const reportId = formData.get("reportId") as string;
    const userId = formData.get("userId") as string;

    // Here you can fetch product details from your DB if needed
    // e.g. const product = await db.products.findOne(productId);

    //https://uxmust.com/report/68b1e660a20be889f6e25cce/edit

    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
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
    if (err instanceof Error) {
      console.error("Stripe checkout session error:", err.message);
    } else {
      console.error("Stripe checkout session unknown error:", err);
    }
    return new NextResponse("Error creating checkout session", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const sessionId = new URL(req.url).searchParams.get("session_id");
    const stripSession = await stripe.checkout.sessions.retrieve(sessionId as string);

    const reportId = stripSession.metadata?.reportId;
    const userId = stripSession.metadata?.userId;

    await dbConnect();
    await Report.findByIdAndUpdate(reportId, {
      isPaid: true,
      createdBy: userId,
      paidAt: new Date(),
      paidBy: userId,
    });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/preview/${reportId}`, 303);
  } catch (err: any) {
    if (err instanceof Error) {
      console.error("Stripe checkout session error:", err.message);
    } else {
      console.error("Stripe checkout session unknown error:", err);
    }
    return new NextResponse("Error creating checkout session", { status: 500 });
  }
}
