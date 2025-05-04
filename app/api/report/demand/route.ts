// app/api/demand/route.ts

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import Project from "@/models/Project";
import User from "@/models/User";

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { userId, projectId, url, heuristics, scores, overallScore, predefinedIssues, sector, pageType } =
      await request.json();

    if (!projectId || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const createdBy = await User.findById(userId);
    if (!createdBy) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newReport = await Report.create({
      createdBy,
      project,
      url,
      sector,
      pageType,
      scores,
      overallScore,
      heuristics,
      snapshotHtml: "empty",
      status: "unassigned",
      predefinedIssues,
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error: any) {
    console.error("Error creating :", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
