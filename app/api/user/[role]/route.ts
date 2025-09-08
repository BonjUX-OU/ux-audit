import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import { UserRoleType } from "@/types/user.types";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: any) {
  try {
    const { role } = await params;

    if (!role) {
      return new NextResponse("User role is required", { status: 400 });
    }

    await dbConnect();

    const contributors = await User.find({ role: UserRoleType.Contributor });

    if (!contributors) {
      return new NextResponse("Couldn't find any contributer user.", { status: 404 });
    }

    const result = JSON.stringify(contributors);

    return new NextResponse(result, {
      status: 200,
    });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message, { status: 500 });
  }
}
