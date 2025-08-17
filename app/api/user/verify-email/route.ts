// app/api/user/verify-email/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { signIn } from "next-auth/react";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";

export async function POST(request: Request, response: NextResponse) {
  try {
    const { token } = await request.json();
    const cookieStore = await cookies();
    const hasSession = cookieStore.get("register_session")?.value;

    await dbConnect();

    const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: twoDaysAgo },
    });

    // if (!user) {
    //   return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    // }

    // user.verified = true;
    // user.verificationToken = null;
    // user.verificationTokenExpires = null;

    // await user.save();

    // if (hasSession) {
      // const sessionToken = await encode({
      //   token: { id: user.id, email: user.email },
      //   secret: process.env.NEXTAUTH_SECRET!,
      //   maxAge: 60 * 60 * 24 * 30, // 30 days
      // });

      // (await cookies()).set("next-auth.session-token", sessionToken, {
      //   path: "/",
      //   httpOnly: true,
      //   sameSite: "lax",
      //   secure: process.env.NODE_ENV === "production",
      //   maxAge: 60 * 60 * 24 * 30,
      // });

      return NextResponse.redirect(new URL("/dashboard", process.env.NEXT_PUBLIC_APP_URL));
      // return NextResponse.redirect(new URL("/dashboard", request.url));

    // }
  } catch (error: any) {
    console.error("Error fetching :", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
