// app/api//route.ts
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Report from "@/models/Report";
import ReportIssue from "@/models/ReportIssue";
import { ReportType } from "@/types/report.types";
import { ReportStatus } from "@/components/organisms/ReportList/ReportList.types";

export const revalidate = 0;
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const projectId = searchParams.get("projectId");

    if (id) {
      const single = await Report.findById(id);
      if (!single) {
        return NextResponse.json({ error: " not found" }, { status: 404 });
      }
      return NextResponse.json(single, { status: 200 });
    } else if (projectId) {
      const reports = await Report.find({ project: projectId }).populate("project").sort({ createdAt: -1 });
      return NextResponse.json(reports, { status: 200 });
    } else {
      const all = await Report.find().populate("project").sort({ createdAt: -1 });
      return NextResponse.json(all, { status: 200 });
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching reports:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { owner, project, url, scores, overallScore, screenshotImgUrl, sector, pageType } = await request.json();

    if (!project || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newReport = await Report.create({
      owner,
      project,
      url,
      sector,
      pageType,
      scores,
      overallScore,
      screenshotImgUrl: screenshotImgUrl ?? "",
    });

    return NextResponse.json(newReport, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating report:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    const existingReport = await Report.findById(id);
    if (!existingReport) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    const data = await request.json();

    console.log("Data to update:", data);

    const updatedReport = {
      ...existingReport.toObject(),
      ...data,
    };

    console.log("Updated report data:", updatedReport);

    const updated = await Report.findByIdAndUpdate(id, updatedReport);
    if (!updated) {
      return NextResponse.json({ error: "Analysis report not found" }, { status: 404 });
    }
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating report:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    const reportId = new mongoose.Types.ObjectId(id);
    const targetReport = (await Report.findById(reportId)) as ReportType;

    if (
      targetReport &&
      (targetReport.status === ReportStatus.Unassigned || targetReport.status === ReportStatus.NotStarted)
    ) {
      const deleted = await Report.findByIdAndDelete(id);

      if (!deleted) {
        return NextResponse.json({ error: "Analysis report not found" }, { status: 404 });
      } else {
        await ReportIssue.deleteMany({ report: reportId });
      }

      return NextResponse.json({ message: "Analysis report and it's issues deleted successfully" }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "This report cannot be deleted at the moment. Check report status first!" },
        { status: 400 }
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting Analysis report:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}
