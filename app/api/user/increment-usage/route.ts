import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

/**
 * POST /api/user/increment-usage
 * Body: { userId: string }
 *
 * If the user is not subscribed, increment usedAnalyses by 1.
 * used for free-trial usage counting.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Only increment if unsubscribed
    if (!user.subscribed) {
      user.usedAnalyses += 1;
      await user.save();
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error incrementing usage:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
