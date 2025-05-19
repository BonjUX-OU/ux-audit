// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Email from "@/models/Email";
import Report from "@/models/Report";

interface AdminUserDetails {
  _id: string;
  type: "registered" | "waitingList";
  email: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
  totalReports?: number;
  averageScore?: number;
  totalIssues?: number;
  pageTypeDistribution?: Record<string, number>;
  sectorDistribution?: Record<string, number>;
}

export async function GET() {
  try {
    await dbConnect();

    const registeredUsers = await User.find().sort({ createdAt: -1 });
    const adminRegisteredUsers: AdminUserDetails[] = [];

    for (const user of registeredUsers) {
      const userReports = await Report.find({ owner: user._id });

      let sumScore = 0;
      let sumIssues = 0;
      const totalReports = userReports.length;
      const pageTypeDistribution: Record<string, number> = {};
      const sectorDistribution: Record<string, number> = {};

      for (const rep of userReports) {
        sumScore += rep.overallScore;
        let reportIssueCount = 0;
        for (const h of rep.heuristics || []) {
          reportIssueCount += (h.issues || []).length;
        }
        sumIssues += reportIssueCount;

        const pt = rep.pageType || "Unknown";
        pageTypeDistribution[pt] = (pageTypeDistribution[pt] || 0) + reportIssueCount;

        const sec = rep.sector || "Unknown";
        sectorDistribution[sec] = (sectorDistribution[sec] || 0) + reportIssueCount;
      }

      const averageScore = totalReports > 0 ? sumScore / totalReports : 0;

      adminRegisteredUsers.push({
        _id: user._id.toString(),
        type: "registered",
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        totalReports,
        averageScore,
        totalIssues: sumIssues,
        pageTypeDistribution,
        sectorDistribution,
      });
    }

    const waitingListEmails = await Email.find().sort({ createdAt: -1 });
    const adminWaitingUsers: AdminUserDetails[] = waitingListEmails.map((wl) => ({
      _id: wl._id.toString(),
      type: "waitingList",
      email: wl.email,
      createdAt: wl.createdAt,
      updatedAt: wl.updatedAt,
      totalReports: 0,
      averageScore: 0,
      totalIssues: 0,
      pageTypeDistribution: {},
      sectorDistribution: {},
    }));

    const combined = [...adminRegisteredUsers, ...adminWaitingUsers];
    return NextResponse.json(combined, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching admin user details:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}
