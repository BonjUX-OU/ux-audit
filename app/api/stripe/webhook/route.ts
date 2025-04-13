import { NextResponse } from "next/server";
import Stripe from "stripe";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

// 1) Force Node.js runtime so we can read the unmodified request body:
export const runtime = "nodejs";

// 2) Create a new Stripe instance with a stable API version:
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-03-31.basil",
});

export async function POST(request: Request) {
  // 3) Extract the signature from the 'stripe-signature' header
  const signature = request.headers.get("stripe-signature") || "";

  // 4) Read the raw request body as a string
  const buf = await request.arrayBuffer();
  const rawBody = Buffer.from(buf).toString("utf8");

  let event: Stripe.Event;

  try {
    // 5) Use Stripe's constructEvent(rawBody, signature, endpointSecret) to verify
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      // Make sure STRIPE_WEBHOOK_SECRET matches exactly the “Reveal secret” from your Stripe Dashboard
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    // Return 400 so Stripe knows the webhook failed
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 6) If verification is successful, handle the Stripe event
  try {
    // Connect to your DB if needed
    await dbConnect();

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        // If it's a subscription and we have an email, mark user as subscribed
        if (
          session.mode === "subscription" &&
          session.customer_details?.email
        ) {
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
    console.error("Stripe webhook handler error:", event.type, error.message);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  // 7) Return a 200 so Stripe sees a successful response
  return new NextResponse("Success", { status: 200 });
}
