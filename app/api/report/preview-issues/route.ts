// app/api/report/preview-issues/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import ReportIssue from "@/models/ReportIssue";
import { ReportIssueType } from "@/types/reportIssue.types";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/configs/auth/authOptions";
import { UserRoleType } from "@/types/user.types";
import Report from "@/models/Report";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const reportId = searchParams.get("reportId");
    const session = await getServerSession(authOptions);

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    const report = await Report.findById(reportId);

    const reportIssues = await ReportIssue.find({ report: reportId }).sort({ createdAt: -1 });
    const serializedIssues = JSON.parse(JSON.stringify(reportIssues)) as ReportIssueType[];
    const sortedIssuesBySnapshotLocation = serializedIssues.sort(
      (a, b) => a.snapshotLocation.top - b.snapshotLocation.top
    );

    const topThreeIssues = sortedIssuesBySnapshotLocation.slice(0, 3);
    const previewIssues = sortedIssuesBySnapshotLocation.slice(3).map((issue) => ({
      report: issue.report,
      heuristic: issue.heuristic,
      severityLevel: issue.severityLevel,
      order: issue.order,
      snapshotLocation: issue.snapshotLocation,
    }));

    if (session) {
      // If the user is a customer, ensure they own the report
      if (session.user?.role === UserRoleType.Customer) {
        const ownsReport = report?.owner?.toString() === session.user._id;

        if (!ownsReport) {
          return NextResponse.json({ error: "Unauthorized access to report issues" }, { status: 403 });
        } else {
          const isPaid = report.isPaid;

          if (isPaid) {
            return NextResponse.json(
              { report, issues: reportIssues, previewIssues: [], shareAvailable: false },
              { status: 200 }
            );
          } else {
            return NextResponse.json(
              { report, issues: topThreeIssues, previewIssues, shareAvailable: false },
              { status: 200 }
            );
          }
        }
      } else if (session.user?.role === UserRoleType.Validator || session.user?.role === UserRoleType.Contributor) {
        return NextResponse.json(
          { report, issues: reportIssues, previewIssues: [], shareAvailable: true },
          { status: 200 }
        );
      }
    } else {
      return NextResponse.json(
        { report, issues: topThreeIssues, previewIssues, shareAvailable: false },
        { status: 200 }
      );
    }
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
