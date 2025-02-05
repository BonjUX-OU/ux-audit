import dbConnect from "@/lib/dbConnect";
import Email from "@/models/Email";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await dbConnect();
    const emails = await Email.find().sort({
      createdAt: -1,
    });
    return new NextResponse(JSON.stringify(emails), {
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
    const { email } = await request.json();

    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return new NextResponse(JSON.stringify(existingEmail), {
        status: 200,
      });
    }

    const newEmail = await Email.create({ email });

    return new NextResponse(JSON.stringify(newEmail), {
      status: 201,
    });
  } catch (error: any) {
    return new NextResponse(error.message, {
      status: 500,
    });
  }
}
