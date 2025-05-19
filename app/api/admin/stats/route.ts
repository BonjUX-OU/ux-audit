// app/api/admin/stats/route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import Email from "@/models/Email";
import Project from "@/models/Project";
import Report from "@/models/Report";
import { Model, Schema } from "mongoose";

// Helper: returns a date "days" days ago
function getPastDate(days: number) {
  const now = new Date();
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}
function getPastYears(years: number) {
  const now = new Date();
  return new Date(now.setFullYear(now.getFullYear() - years));
}

// Daily counts for the last X days
// We'll do a simple day-by-day loop, counting docs each day.
async function getDailyCounts(Model: Model<Schema>, days: number): Promise<number[]> {
  const counts: number[] = [];
  // We'll go from "today - days" up to "today - 1 day"
  // Then for the last iteration, it's "today"
  // We'll store them in ascending order or descending order as we like.

  // Let's store ascending. We'll define a reference date "start"
  // and for i in [0..days) we create day i.
  // Then do a 1-day range each time.
  const now = new Date();
  const earliest = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // We'll step from day 0 to day n, each time counting docs for that day.
  let current = new Date(earliest);
  for (let i = 0; i < days; i++) {
    // start of the day
    const start = new Date(current);
    start.setHours(0, 0, 0, 0);

    // end of the day = start + 24h
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    // Count how many docs have createdAt in [start, end)
    const count = await Model.countDocuments({
      createdAt: { $gte: start, $lt: end },
    });
    counts.push(count);

    // increment current by 1 day
    current = end;
  }

  return counts;
}

export async function GET() {
  try {
    await dbConnect();

    // 1) Basic totals
    const totalUsers = await User.countDocuments();
    const totalWaitingList = await Email.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalReports = await Report.countDocuments();

    // 2) Human-edited vs AI
    const totalHumanEditedReports = await Report.countDocuments({
      humanEdited: true,
    });

    // 3) Date-range queries for stats
    const last24Hours = getPastDate(1);
    const last7Days = getPastDate(7);
    const last30Days = getPastDate(30);
    const last90Days = getPastDate(90);
    const last12Months = getPastDate(365);
    const last3Years = getPastYears(3);

    const [
      users24,
      users7,
      users30,
      users90,
      users12m,
      users3y,
      projects24,
      projects7,
      projects30,
      projects90,
      projects12m,
      projects3y,
      reports24,
      reports7,
      reports30,
      reports90,
      reports12m,
      reports3y,
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: last24Hours } }),
      User.countDocuments({ createdAt: { $gte: last7Days } }),
      User.countDocuments({ createdAt: { $gte: last30Days } }),
      User.countDocuments({ createdAt: { $gte: last90Days } }),
      User.countDocuments({ createdAt: { $gte: last12Months } }),
      User.countDocuments({ createdAt: { $gte: last3Years } }),

      Project.countDocuments({ createdAt: { $gte: last24Hours } }),
      Project.countDocuments({ createdAt: { $gte: last7Days } }),
      Project.countDocuments({ createdAt: { $gte: last30Days } }),
      Project.countDocuments({ createdAt: { $gte: last90Days } }),
      Project.countDocuments({ createdAt: { $gte: last12Months } }),
      Project.countDocuments({ createdAt: { $gte: last3Years } }),

      Report.countDocuments({ createdAt: { $gte: last24Hours } }),
      Report.countDocuments({ createdAt: { $gte: last7Days } }),
      Report.countDocuments({ createdAt: { $gte: last30Days } }),
      Report.countDocuments({ createdAt: { $gte: last90Days } }),
      Report.countDocuments({ createdAt: { $gte: last12Months } }),
      Report.countDocuments({ createdAt: { $gte: last3Years } }),
    ]);

    // 4) Page type, sector distribution, heuristic stats
    const allReports = await Report.find({}, { heuristics: 1, scores: 1, pageType: 1, sector: 1 });

    const pageTypeIssueCount: Record<string, number> = {};
    const sectorIssueCount: Record<string, number> = {};

    const heuristicIssueCountMap: Record<number, number> = {};
    const heuristicNamesMap: Record<number, string> = {};

    interface HeuristicScoreData {
      totalScore: number;
      count: number;
    }
    const heuristicScoreMap: Record<number, HeuristicScoreData> = {};

    for (const rep of allReports) {
      // count total issues in this report
      let reportIssueCount = 0;
      for (const h of rep.heuristics || []) {
        heuristicNamesMap[h.id] = h.name;
        const issueCount = h.issues ? h.issues.length : 0;
        heuristicIssueCountMap[h.id] = (heuristicIssueCountMap[h.id] || 0) + issueCount;
        reportIssueCount += issueCount;
      }

      // Page type aggregator
      const pt = rep.pageType || "Unknown";
      pageTypeIssueCount[pt] = (pageTypeIssueCount[pt] || 0) + reportIssueCount;

      // Sector aggregator
      const s = rep.sector || "Unknown";
      sectorIssueCount[s] = (sectorIssueCount[s] || 0) + reportIssueCount;

      // Heuristic average scores
      for (const sc of rep.scores || []) {
        const scId = sc.id;
        const parsed = parseFloat(sc.score);
        if (!isNaN(parsed)) {
          if (!heuristicScoreMap[scId]) {
            heuristicScoreMap[scId] = { totalScore: 0, count: 0 };
          }
          heuristicScoreMap[scId].totalScore += parsed;
          heuristicScoreMap[scId].count += 1;
        }
      }
    }

    // Sort heuristics by totalIssues desc
    const heuristicsSorted = Object.entries(heuristicIssueCountMap)
      .map(([idStr, totalIssues]) => ({
        id: parseInt(idStr, 10),
        name: heuristicNamesMap[parseInt(idStr, 10)],
        totalIssues,
      }))
      .sort((a, b) => b.totalIssues - a.totalIssues);

    const mostIssues = heuristicsSorted.length ? heuristicsSorted[0] : null;
    const leastIssues = heuristicsSorted.length ? heuristicsSorted[heuristicsSorted.length - 1] : null;

    // Average heuristic scores
    const heuristicScoreAverages = Object.entries(heuristicScoreMap).map(([idStr, data]) => {
      const idNum = parseInt(idStr, 10);
      const avg = data.count ? data.totalScore / data.count : 0;
      return {
        id: idNum,
        name: heuristicNamesMap[idNum] || `Heuristic ${idNum}`,
        averageScore: avg,
      };
    });
    heuristicScoreAverages.sort((a, b) => a.id - b.id);

    // 5) Actual daily counts for last 30 days for line chart
    const DAYS = 30;
    // For "labels", we'll just store YYYY-MM-DD
    const now = new Date();
    const labels: string[] = [];
    // We'll gather the daily counts
    const [userDaily, projectDaily, reportDaily] = await Promise.all([
      getDailyCounts(User, DAYS),
      getDailyCounts(Project, DAYS),
      getDailyCounts(Report, DAYS),
    ]);

    // Because getDailyCounts returns an array of length=30 in ascending order,
    // we build the matching "labels" in ascending order too.
    // Start from earliest date:
    const earliest = new Date(now.getTime() - DAYS * 24 * 60 * 60 * 1000);
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(earliest);
      d.setDate(earliest.getDate() + i);
      // format as YYYY-MM-DD
      const label = d.toISOString().split("T")[0];
      labels.push(label);
    }

    // Build final data
    const data = {
      totalUsers,
      totalWaitingList,
      totalProjects,
      totalReports,
      totalHumanEditedReports,

      dateRangeStats: {
        users: {
          "24h": users24,
          "7d": users7,
          "30d": users30,
          "90d": users90,
          "12m": users12m,
          "3y": users3y,
        },
        projects: {
          "24h": projects24,
          "7d": projects7,
          "30d": projects30,
          "90d": projects90,
          "12m": projects12m,
          "3y": projects3y,
        },
        reports: {
          "24h": reports24,
          "7d": reports7,
          "30d": reports30,
          "90d": reports90,
          "12m": reports12m,
          "3y": reports3y,
        },
      },
      pageTypeDistribution: pageTypeIssueCount,
      sectorDistribution: sectorIssueCount,
      heuristicStats: {
        distribution: heuristicsSorted,
        mostIssues,
        leastIssues,
      },
      heuristicScoreAverages,

      // Actual time-series for line chart
      timeSeries: {
        labels, // e.g. ["2023-09-01","2023-09-02",...]
        users: userDaily, // daily count of new users
        projects: projectDaily,
        reports: reportDaily,
      },
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching admin stats:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}
