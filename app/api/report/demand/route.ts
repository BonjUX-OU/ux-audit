// app/api/report/demand/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import Project from "@/models/Project";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/configs/auth/authOptions";
import mongoose from "mongoose";
import { ReportStatus } from "@/components/organisms/ReportList/ReportList.types";

export async function POST(request: Request) {
  try {
    const { project, url, heuristics, scores, overallScore, predefinedIssues, sector, pageType } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL field is required" }, { status: 400 });
    }

    const checkedProject = await Project.findById(project);
    if (!checkedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

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

    const newReport = await Report.create({
      createdBy,
      project: checkedProject,
      url,
      sector,
      pageType,
      scores,
      overallScore,
      heuristics,
      status: ReportStatus.Unassigned,
      predefinedIssues,
    });

    return NextResponse.json(newReport, { status: 201 });
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
