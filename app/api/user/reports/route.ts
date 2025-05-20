// app/api/user/reports/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/configs/auth/authOptions";
import { ReportRequestType } from "@/components/organisms/ReportList/ReportList.types";
import { UserRoleType } from "@/types/user.types";

export const revalidate = 0;

// To fetch all reports.
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    let reports;
    switch (session.user?.role) {
      case UserRoleType.Validator:
        reports = await Report.find().populate("assignedTo").sort({ createdAt: -1 });
        break;
      case UserRoleType.Contributor:
        reports = await Report.find({ assignedTo: userId }).sort({ createdAt: -1 });
        break;
      case UserRoleType.Customer:
      default:
        reports = await Report.find({ createdBy: userId }).populate("project").sort({ createdAt: -1 });
        break;
    }

    return NextResponse.json(reports, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching :", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// To fetch all by filter that passed by request body. Filtering,pagination..
// fetchReportsByFilter method is calling this endpoint with sample payload.
export async function POST(request: Request) {
  try {
    await dbConnect();
    const requestBody = (await request.json()) as ReportRequestType;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!requestBody.userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    let reports;
    if (session.user?.role && session.user?.role !== UserRoleType.Customer) {
      reports = await Report.find({ createdBy: requestBody.userId, status: requestBody.reportStatus }).sort({
        createdAt: -1,
      });
    } else {
      reports = await Report.find({ createdBy: requestBody.userId }).populate("project").sort({ createdAt: -1 });
    }

    return NextResponse.json(reports, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching :", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
