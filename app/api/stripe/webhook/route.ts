import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

export async function POST(request: Request) {
  const sig = request.headers.get("stripe-signature") || "";
  const buf = await request.arrayBuffer();
  const rawBody = Buffer.from(buf).toString("utf8");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        // Payment Links for recurring charges also produce a Checkout Session
        const session = event.data.object as Stripe.Checkout.Session;
        if (
          session.mode === "subscription" &&
          session.customer_details?.email
        ) {
          await dbConnect();
          const userEmail = session.customer_details.email;
          const user = await User.findOne({ email: userEmail });
          if (user && !user.subscribed) {
            user.subscribed = true;
            user.stripeSubscriptionId = session.subscription as string;
            await user.save();
          }
        }
        break;
      }
      default:
        console.log(`Unhandled Stripe event: ${event.type}`);
    }
  } catch (error: any) {
    console.error("Stripe webhook handler error:", event.type, error.message);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return new NextResponse("Success", { status: 200 });
}
