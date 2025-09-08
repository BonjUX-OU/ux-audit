// app/api/user/verify-email/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";
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
            userId: "to-be-updated-after-payment-success"
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

async function VerifyCustomerEmailAndRedirect(request: Request, hasSession: string | undefined, redirectUrl: string) {
  try {
    const { token } = await request.json();
    await dbConnect();

    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: twoDaysAgo },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    user.verified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();

    if (hasSession) {
      const sessionToken = await encode({
        token: { id: user.id, email: user.email },
        secret: process.env.NEXTAUTH_SECRET!,
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });

      (await cookies()).set("next-auth.session-token", sessionToken, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
      });
      
      if(redirectUrl.includes("dashboard")){
      return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL));
      }
    }
  } catch (error: any) {
    console.error("Error fetching :", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
