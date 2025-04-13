import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// Force the Node.js runtime so we can get the raw request body
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

export async function POST(request: Request) {
  // 1. Get signature from headers
  const sig = request.headers.get("stripe-signature") || "";

  // 2. Read the raw body from arrayBuffer
  const buf = await request.arrayBuffer();
  const rawBody = Buffer.from(buf).toString("utf8");

  let event: Stripe.Event;
  try {
    // 3. Verify the signature with your webhook secret
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error("Stripe signature verification error:", err.message);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 4. Handle event
  try {
    switch (event.type) {
      case "checkout.session.completed": {
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
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error("Webhook handler error:", event.type, error.message);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return new NextResponse("Success", { status: 200 });
}
