// app/api/stripe/checkout-session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Report from "@/models/Report";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil", // or latest supported version
});

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const hasSession = cookieStore.get("register_session")?.value;

    // this is reportId value send to customers for preview
    const registerReportRef = cookieStore.get("register_ref")?.value; // 68b1fabf17cd199ed7137d26
    if (registerReportRef) {
      const report = await Report.findOne({ _id: registerReportRef });
      // if customer come to register page, registered and want to verify email, we have to decide where to redirect them after successfully verified their email
      if (report && !report.isPaid) {
        // Redirect to payment page.
        // Get Stripe Checkout session link from backend.

        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price: "0.1", // <-- Stripe Price ID
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success_stripe/${registerReportRef}`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
          metadata: {
            registerReportRef,
            userId: "to-be-updated-after-payment-success",
          },
        });

        session.url ? await VerifyCustomerEmailAndRedirect(request, hasSession, session.url) : null;
        return NextResponse.redirect(session.url!);
      } else {
        // Redirect to Dashboard.
        await VerifyCustomerEmailAndRedirect(request, hasSession, "/dashboard");
      }
    }
  } catch (error: any) {
    console.error("Error fetching :", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
