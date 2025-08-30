// app/api/user/verify-email/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { signIn } from "next-auth/react";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";
import Report from "@/models/Report";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    const cookieStore = await cookies();
    const hasSession = cookieStore.get("register_session")?.value;

     // this is reportId value send to customers for preview
     const registerReportRef = cookieStore.get("register_ref")?.value; // 68b1fabf17cd199ed7137d26  

     //get the reportById 
     // check its already paid and assigned to a customer.

     const report = await Report.findOne({ _id: registerReportRef });

     if(report && report.paid && report.assignedToEmail){}

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

      return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL));
    }
  } catch (error: any) {
    console.error("Error fetching :", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
