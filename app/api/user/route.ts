// app/api/user/route.ts
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find().sort({
      createdAt: -1,
    });
    return new NextResponse(JSON.stringify(users), {
      status: 200,
    });
  } catch (error: any) {
    return new NextResponse(error.message, {
      status: 500,
    });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { full_name, bio, industry, proffession, goals, interests, email, profile_image } = await request.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new NextResponse(JSON.stringify(existingUser), {
        status: 200,
      });
    }

    const user = await User.create({
      full_name,
      bio,
      industry,
      proffession,
      goals,
      interests,
      email,
      profile_image,
    });

    return new NextResponse(JSON.stringify(user), {
      status: 201,
    });
  } catch (error: any) {
    return new NextResponse(error.message, {
      status: 500,
    });
  }
}
