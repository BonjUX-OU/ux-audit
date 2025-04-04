// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

// Mongoose models
import User from "@/models/User";
import Email from "@/models/Email";
import Report from "@/models/Report";

/**
 * Shape of each user row returned to the admin.
 */
interface AdminUserDetails {
  _id: string;
  type: "registered" | "waitingList";
  email: string;
  name?: string;
  createdAt?: Date; // or string, if you prefer
  updatedAt?: Date; // or string, if you prefer

  // Stats (only meaningful for "registered" users)
  totalReports?: number;
  averageScore?: number;
  totalIssues?: number;
  pageTypeDistribution?: Record<string, number>;
  sectorDistribution?: Record<string, number>;
}

export async function GET() {
  try {
    await dbConnect();

    // 1) Fetch all registered users
    const registeredUsers = await User.find().sort({ createdAt: -1 });

    // For each registered user, gather stats from their reports
    const adminRegisteredUsers: AdminUserDetails[] = [];

    for (const user of registeredUsers) {
      const userId = user._id.toString();
      const userEmail = user.email;
      const userName = user.name;

      // Pull timestamps
      const userCreatedAt = user.createdAt;
      const userUpdatedAt = user.updatedAt;

      // Find all reports for this user
      const userReports = await Report.find({ owner: user._id });

      const totalReports = userReports.length;
      if (totalReports === 0) {
        // If no reports, push zero stats
        adminRegisteredUsers.push({
          _id: userId,
          type: "registered",
          email: userEmail,
          name: userName,
          createdAt: userCreatedAt,
          updatedAt: userUpdatedAt,
          totalReports: 0,
          averageScore: 0,
          totalIssues: 0,
          pageTypeDistribution: {},
          sectorDistribution: {},
        });
        continue;
      }

      // Summation for average overall score, total issues, etc.
      let sumScore = 0;
      let sumIssues = 0;
      const pageTypeDistribution: Record<string, number> = {};
      const sectorDistribution: Record<string, number> = {};

      for (const rep of userReports) {
        // overallScore is required
        sumScore += rep.overallScore;

        // Tally issues
        let reportIssueCount = 0;
        if (rep.heuristics && rep.heuristics.length > 0) {
          for (const h of rep.heuristics) {
            reportIssueCount += (h.issues || []).length;
          }
        }
        sumIssues += reportIssueCount;

        // PageType aggregator
        const pageType = rep.pageType || "Unknown";
        pageTypeDistribution[pageType] =
          (pageTypeDistribution[pageType] || 0) + reportIssueCount;

        // Sector aggregator
        const sector = rep.sector || "Unknown";
        sectorDistribution[sector] =
          (sectorDistribution[sector] || 0) + reportIssueCount;
      }

      const averageScore = sumScore / totalReports;

      adminRegisteredUsers.push({
        _id: userId,
        type: "registered",
        email: userEmail,
        name: userName,
        createdAt: userCreatedAt,
        updatedAt: userUpdatedAt,
        totalReports,
        averageScore,
        totalIssues: sumIssues,
        pageTypeDistribution,
        sectorDistribution,
      });
    }

    // 2) Fetch all waiting list entries
    const waitingListEmails = await Email.find().sort({ createdAt: -1 });

    const adminWaitingUsers: AdminUserDetails[] = waitingListEmails.map(
      (wl) => ({
        _id: wl._id.toString(),
        type: "waitingList",
        email: wl.email,
        // We only have createdAt and updatedAt from the Email model
        createdAt: wl.createdAt,
        updatedAt: wl.updatedAt,

        // Stats are meaningless for waiting list
        totalReports: 0,
        averageScore: 0,
        totalIssues: 0,
        pageTypeDistribution: {},
        sectorDistribution: {},
      })
    );

    // 3) Combine them (registered first, then waiting list)
    const combined = [...adminRegisteredUsers, ...adminWaitingUsers];

    return NextResponse.json(combined, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching admin user details:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
