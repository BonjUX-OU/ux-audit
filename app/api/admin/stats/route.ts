import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";

import User from "@/models/User";
import Email from "@/models/Email";
import Project from "@/models/Project";
import Report from "@/models/Report";

// Helper function to get date ranges
function getPastDate(days: number) {
  const now = new Date();
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function getPastYears(years: number) {
  const now = new Date();
  return new Date(now.setFullYear(now.getFullYear() - years));
}

// ----- TIME SERIES HELPER -----
// Return an array of daily counts for the last `days` days, in ascending order.
async function getDailyCounts(Model: any, days = 30) {
  const results: { date: string; count: number }[] = [];

  // We'll go from the oldest day to the most recent day
  // Day i=days-1 => the oldest day, i=0 => "today"
  // so final array is ascending in date
  for (let i = days - 1; i >= 0; i--) {
    // Start of the day
    const start = new Date();
    start.setHours(0, 0, 0, 0); // midnight
    start.setDate(start.getDate() - i);

    // Next day
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const count = await Model.countDocuments({
      createdAt: {
        $gte: start,
        $lt: end,
      },
    });

    // Format the date label (YYYY-MM-DD) or anything you like
    const label = start.toISOString().split("T")[0]; // e.g. 2025-04-04

    results.push({ date: label, count });
  }

  return results;
}

export async function GET() {
  try {
    await dbConnect();

    // ---- BASIC COUNTS ----
    const totalUsers = await User.countDocuments();
    const totalWaitingList = await Email.countDocuments();
    const totalProjects = await Project.countDocuments();
    const totalReports = await Report.countDocuments();

    // ---- HUMAN-EDITED REPORTS ----
    const totalHumanEditedReports = await Report.countDocuments({
      humanEdited: true,
    });

    // ---- DATE RANGE QUERIES ----
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
      // user counts
      User.countDocuments({ createdAt: { $gte: last24Hours } }),
      User.countDocuments({ createdAt: { $gte: last7Days } }),
      User.countDocuments({ createdAt: { $gte: last30Days } }),
      User.countDocuments({ createdAt: { $gte: last90Days } }),
      User.countDocuments({ createdAt: { $gte: last12Months } }),
      User.countDocuments({ createdAt: { $gte: last3Years } }),

      // project counts
      Project.countDocuments({ createdAt: { $gte: last24Hours } }),
      Project.countDocuments({ createdAt: { $gte: last7Days } }),
      Project.countDocuments({ createdAt: { $gte: last30Days } }),
      Project.countDocuments({ createdAt: { $gte: last90Days } }),
      Project.countDocuments({ createdAt: { $gte: last12Months } }),
      Project.countDocuments({ createdAt: { $gte: last3Years } }),

      // report counts
      Report.countDocuments({ createdAt: { $gte: last24Hours } }),
      Report.countDocuments({ createdAt: { $gte: last7Days } }),
      Report.countDocuments({ createdAt: { $gte: last30Days } }),
      Report.countDocuments({ createdAt: { $gte: last90Days } }),
      Report.countDocuments({ createdAt: { $gte: last12Months } }),
      Report.countDocuments({ createdAt: { $gte: last3Years } }),
    ]);

    // ---- GET ALL REPORTS (FOR DISTRIBUTIONS) ----
    const allReports = await Report.find(
      {},
      { heuristics: 1, scores: 1, pageType: 1, sector: 1 }
    );

    // PAGE TYPE / SECTOR / HEURISTIC DISTRIBUTIONS
    const pageTypeIssueCount: Record<string, number> = {};
    const sectorIssueCount: Record<string, number> = {};

    const heuristicIssueCountMap: Record<number, number> = {};
    const heuristicNamesMap: Record<number, string> = {};

    // For averaging heuristic scores
    interface HeuristicScoreData {
      totalScore: number;
      count: number;
    }
    const heuristicScoreMap: Record<number, HeuristicScoreData> = {};

    for (const rep of allReports) {
      // Count issues in heuristics
      let reportIssueCount = 0;
      (rep.heuristics || []).forEach(
        (heuristic: { id: any; name: string; issues: string | any[] }) => {
          const hId = heuristic.id;
          heuristicNamesMap[hId] = heuristic.name;

          const issueCount = heuristic.issues ? heuristic.issues.length : 0;
          heuristicIssueCountMap[hId] =
            (heuristicIssueCountMap[hId] || 0) + issueCount;
          reportIssueCount += issueCount;
        }
      );

      // pageType aggregator
      const pt = rep.pageType || "Unknown";
      pageTypeIssueCount[pt] = (pageTypeIssueCount[pt] || 0) + reportIssueCount;

      // sector aggregator
      const sec = rep.sector || "Unknown";
      sectorIssueCount[sec] = (sectorIssueCount[sec] || 0) + reportIssueCount;

      // average heuristic scores
      (rep.scores || []).forEach((sc: { id: any; score: string }) => {
        const id = sc.id;
        const parsed = parseFloat(sc.score);
        if (!isNaN(parsed)) {
          if (!heuristicScoreMap[id]) {
            heuristicScoreMap[id] = { totalScore: 0, count: 0 };
          }
          heuristicScoreMap[id].totalScore += parsed;
          heuristicScoreMap[id].count += 1;
        }
      });
    }

    // Convert heuristicIssueCountMap to sorted array
    const heuristicsSorted = Object.entries(heuristicIssueCountMap)
      .map(([idStr, totalIssues]) => {
        const id = parseInt(idStr, 10);
        return {
          id,
          name: heuristicNamesMap[id] || `Heuristic ${id}`,
          totalIssues,
        };
      })
      .sort((a, b) => b.totalIssues - a.totalIssues);

    const mostIssues = heuristicsSorted.length ? heuristicsSorted[0] : null;
    const leastIssues = heuristicsSorted.length
      ? heuristicsSorted[heuristicsSorted.length - 1]
      : null;

    // build average score array
    const heuristicScoreAverages = Object.entries(heuristicScoreMap).map(
      ([idStr, data]) => {
        const id = parseInt(idStr, 10);
        const avg = data.count > 0 ? data.totalScore / data.count : 0;
        return {
          id,
          name: heuristicNamesMap[id] || `Heuristic ${id}`,
          averageScore: avg,
        };
      }
    );
    heuristicScoreAverages.sort((a, b) => a.id - b.id);

    // ---- TIME SERIES: LAST 30 DAYS FOR USERS, PROJECTS, REPORTS ----
    const [userDaily, projectDaily, reportDaily] = await Promise.all([
      getDailyCounts(User, 30), // returns array of {date, count}
      getDailyCounts(Project, 30),
      getDailyCounts(Report, 30),
    ]);

    // We'll unify them based on the date field. Since each array is ascending,
    // we can combine them into a final object with arrays of counts for the chart.
    // For simplicity, assume they have identical length & date ordering (30 days).
    const labels = userDaily.map((item) => item.date);
    const usersTimeSeries = userDaily.map((item) => item.count);
    const projectsTimeSeries = projectDaily.map((item) => item.count);
    const reportsTimeSeries = reportDaily.map((item) => item.count);

    // Build final data
    const data = {
      // Basic counts
      totalUsers,
      totalWaitingList,
      totalProjects,
      totalReports,
      totalHumanEditedReports,

      // time-based stats
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

      // page-type distribution
      pageTypeDistribution: pageTypeIssueCount,

      // sector distribution
      sectorDistribution: sectorIssueCount,

      // heuristic-based stats
      heuristicStats: {
        distribution: heuristicsSorted,
        mostIssues,
        leastIssues,
      },

      // heuristic score averages
      heuristicScoreAverages,

      // NEW: 30-day time series
      timeSeries: {
        labels, // array of date strings
        users: usersTimeSeries, // array of daily counts
        projects: projectsTimeSeries,
        reports: reportsTimeSeries,
      },
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
