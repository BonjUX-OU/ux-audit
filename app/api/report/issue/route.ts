// app/api/report/issue/route.ts
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import ReportIssue from "@/models/ReportIssue";
import { authOptions } from "@/lib/configs/auth/authOptions";
import { ReportIssueType } from "@/types/reportIssue.types";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    const reportIssues = await ReportIssue.find({ report: reportId }).sort({ createdAt: -1 });

    return NextResponse.json(reportIssues, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching issues:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as ReportIssueType;

    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const userId = new mongoose.Types.ObjectId(session.user?._id);

    const createdBy = await User.findById(userId);
    if (!createdBy) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newReportIssue = await ReportIssue.create({
      ...data,
      createdBy,
      updatedBy: createdBy,
    });

    return NextResponse.json(newReportIssue, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating :", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}
