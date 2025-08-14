// app/api/user/verify-email/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { signIn } from "next-auth/react";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const cookieStore = await cookies();
    const hasSession = cookieStore.get("register_session")?.value;

    await dbConnect();

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: fifteenMinutesAgo },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }

    user.verified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;

    await user.save();

    if (hasSession) {
      // Automatically log in the user if they have a session
      const result = await signIn("credentials", {
        callbackUrl: "/dashboard",
        email: user.email,
        password: user.password,
      });

      if (!result?.ok) {
        return NextResponse.json({ error: "Failed to log in user" }, { status: 500 });
      }
    } else {
      return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
    }
  } catch (error: any) {
    console.error("Error fetching :", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
