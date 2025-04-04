"use client";

import { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  LineChart,
  Search,
  Users,
  FileText,
  Filter,
  Download,
  ChevronDown,
} from "lucide-react";
import { subDays, subMonths, subYears } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
  TimeScale,
  TimeSeriesScale,
} from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import Link from "next/link";
import Image from "next/image";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement,
  TimeScale,
  TimeSeriesScale
);

// Types
type HeuristicDistributionItem = {
  id: number;
  name: string;
  totalIssues: number;
};

type HeuristicStats = {
  distribution: HeuristicDistributionItem[];
  mostIssues: HeuristicDistributionItem | null;
  leastIssues: HeuristicDistributionItem | null;
};

type DateRangeStats = {
  users: Record<string, number>;
  projects: Record<string, number>;
  reports: Record<string, number>;
};

type HeuristicScoreAverage = {
  id: number;
  name: string;
  averageScore: number;
};

interface AdminStatsResponse {
  totalUsers: number;
  totalWaitingList: number;
  totalProjects: number;
  totalReports: number;
  totalHumanEditedReports: number;
  dateRangeStats: DateRangeStats;
  pageTypeDistribution: Record<string, number>;
  sectorDistribution: Record<string, number>;
  heuristicStats: HeuristicStats;
  heuristicScoreAverages: HeuristicScoreAverage[];
}

interface AdminUserDetails {
  _id: string;
  type: "registered" | "waitingList";
  email: string;
  name?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  totalReports?: number;
  averageScore?: number;
  totalIssues?: number;
  pageTypeDistribution?: Record<string, number>;
  sectorDistribution?: Record<string, number>;
}

// Time period options
const TIME_PERIODS = [
  { value: "24h", label: "Last 24 Hours" },
  { value: "7d", label: "Last 7 Days" },
  { value: "30d", label: "Last 30 Days" },
  { value: "90d", label: "Last 90 Days" },
  { value: "12m", label: "Last 12 Months" },
  { value: "3y", label: "Last 3 Years" },
  { value: "all", label: "All Time" },
];

// UXMust theme colors
const THEME = {
  primary: "#B94A2F", // Terracotta red for primary actions
  primaryLight: "#E57A5F", // Lighter version of primary
  background: "#FFF5E6", // Cream background
  text: "#1E2A3B", // Dark navy text
  muted: "#8896AB", // Muted text
  accent: "#F8B400", // Yellow accent
  success: "#4CAF50", // Green for success
  warning: "#FF9800", // Orange for warnings
  error: "#F44336", // Red for errors
  chart: {
    users: "#B94A2F", // Primary color for users
    reports: "#F8B400", // Accent color for reports
    projects: "#1E2A3B", // Text color for projects
    humanEdited: "#4CAF50", // Success color for human edited
    aiOnly: "#8896AB", // Muted color for AI only
  },
};

export default function AdminDashboard() {
  // State
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [userDetails, setUserDetails] = useState<AdminUserDetails[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUserDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [timePeriod, setTimePeriod] = useState<string>("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDataSeries, setSelectedDataSeries] = useState({
    users: true,
    reports: true,
    projects: true,
  });

  // Generate time series data for charts
  const [timeSeriesData, setTimeSeriesData] = useState<{
    users: { x: Date; y: number }[];
    reports: { x: Date; y: number }[];
    projects: { x: Date; y: number }[];
  }>({
    users: [],
    reports: [],
    projects: [],
  });

  // Fetch main stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data: AdminStatsResponse = await res.json();
        setStats(data);

        // Generate time series data for charts
        generateTimeSeriesData(data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch user details
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data: AdminUserDetails[] = await res.json();
        setUserDetails(data);
        setFilteredUsers(data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users when search term or user type filter changes
  useEffect(() => {
    if (!userDetails.length) return;

    let filtered = [...userDetails];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.email.toLowerCase().includes(term) ||
          (user.name && user.name.toLowerCase().includes(term))
      );
    }

    // Filter by user type
    if (userTypeFilter !== "all") {
      filtered = filtered.filter((user) => user.type === userTypeFilter);
    }

    // Filter by time period if applicable
    if (timePeriod !== "all") {
      const cutoffDate = getDateFromTimePeriod(timePeriod);
      filtered = filtered.filter((user) => {
        if (!user.createdAt) return false;
        const createdDate = new Date(user.createdAt);
        return createdDate >= cutoffDate;
      });
    }

    setFilteredUsers(filtered);
  }, [searchTerm, userTypeFilter, userDetails, timePeriod]);

  // Get cutoff date based on time period
  const getDateFromTimePeriod = (period: string): Date => {
    const now = new Date();
    switch (period) {
      case "24h":
        return subDays(now, 1);
      case "7d":
        return subDays(now, 7);
      case "30d":
        return subDays(now, 30);
      case "90d":
        return subDays(now, 90);
      case "12m":
        return subMonths(now, 12);
      case "3y":
        return subYears(now, 3);
      default:
        return new Date(0); // Beginning of time
    }
  };

  // Generate time series data for line charts
  const generateTimeSeriesData = (data: AdminStatsResponse) => {
    if (!data) return;

    const now = new Date();
    const users: { x: Date; y: number }[] = [];
    const reports: { x: Date; y: number }[] = [];
    const projects: { x: Date; y: number }[] = [];

    // Determine how many data points to generate based on time period
    let days = 30;
    switch (timePeriod) {
      case "24h":
        days = 24;
        break; // 24 hours, hourly data points
      case "7d":
        days = 7;
        break;
      case "30d":
        days = 30;
        break;
      case "90d":
        days = 90;
        break;
      case "12m":
        days = 365;
        break;
      case "3y":
        days = 365 * 3;
        break;
      case "all":
        days = 365 * 3;
        break; // Default to 3 years for "all"
    }

    // Generate data points
    for (let i = days; i >= 0; i--) {
      const date = subDays(now, i);

      // Simulate cumulative data based on the stats
      // In a real app, you'd fetch actual daily data from your API
      const dayFactor = (days - i) / days;

      users.push({
        x: date,
        y: Math.round(
          data.totalUsers * dayFactor * (0.9 + Math.random() * 0.2)
        ),
      });

      reports.push({
        x: date,
        y: Math.round(
          data.totalReports * dayFactor * (0.85 + Math.random() * 0.3)
        ),
      });

      projects.push({
        x: date,
        y: Math.round(
          data.totalProjects * dayFactor * (0.88 + Math.random() * 0.24)
        ),
      });
    }

    setTimeSeriesData({ users, reports, projects });
  };

  // Update time series data when time period changes
  useEffect(() => {
    if (stats) {
      generateTimeSeriesData(stats);
    }
  }, [timePeriod]);

  // Helper for date display
  function formatDate(date?: string | Date) {
    if (!date) return "";
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleString();
  }

  // Get filtered stats based on time period
  const getFilteredStats = useMemo(() => {
    if (!stats) return null;

    // For the overview cards, use the dateRangeStats directly
    if (timePeriod === "24h")
      return {
        users: stats.dateRangeStats.users["24h"],
        reports: stats.dateRangeStats.reports["24h"],
        projects: stats.dateRangeStats.projects["24h"],
      };
    if (timePeriod === "7d")
      return {
        users: stats.dateRangeStats.users["7d"],
        reports: stats.dateRangeStats.reports["7d"],
        projects: stats.dateRangeStats.projects["7d"],
      };
    if (timePeriod === "30d")
      return {
        users: stats.dateRangeStats.users["30d"],
        reports: stats.dateRangeStats.reports["30d"],
        projects: stats.dateRangeStats.projects["30d"],
      };
    if (timePeriod === "90d")
      return {
        users: stats.dateRangeStats.users["90d"],
        reports: stats.dateRangeStats.reports["90d"],
        projects: stats.dateRangeStats.projects["90d"],
      };
    if (timePeriod === "12m")
      return {
        users: stats.dateRangeStats.users["12m"],
        reports: stats.dateRangeStats.reports["12m"],
        projects: stats.dateRangeStats.projects["12m"],
      };
    if (timePeriod === "3y")
      return {
        users: stats.dateRangeStats.users["3y"],
        reports: stats.dateRangeStats.reports["3y"],
        projects: stats.dateRangeStats.projects["3y"],
      };

    // Default to total counts for "all"
    return {
      users: stats.totalUsers,
      reports: stats.totalReports,
      projects: stats.totalProjects,
    };
  }, [stats, timePeriod]);

  // Loading state
  if (loading || loadingUsers) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4"
            style={{
              borderColor: `${THEME.primary} transparent ${THEME.primary} transparent`,
            }}
          ></div>
          <p style={{ color: THEME.muted }}>Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ backgroundColor: THEME.background }}
      >
        <div className="text-center">
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: THEME.text }}
          >
            No Data Available
          </h2>
          <p style={{ color: THEME.muted }}>
            No admin stats data could be retrieved.
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  // Human vs AI pie chart
  const humanEditedCount = stats.totalHumanEditedReports;
  const aiOnlyCount = stats.totalReports - humanEditedCount;
  const humanVsAiPieData = {
    labels: ["Human Edited", "AI Only"],
    datasets: [
      {
        label: "Report Type",
        data: [humanEditedCount, aiOnlyCount],
        backgroundColor: [THEME.chart.humanEdited, THEME.chart.aiOnly],
        borderColor: ["#ffffff", "#ffffff"],
        borderWidth: 2,
      },
    ],
  };

  // Page type distribution pie chart
  const pageTypeLabels = Object.keys(stats.pageTypeDistribution);
  const pageTypeValues = Object.values(stats.pageTypeDistribution);
  const pageTypePieData = {
    labels: pageTypeLabels,
    datasets: [
      {
        label: "Total Issues",
        data: pageTypeValues,
        backgroundColor: [
          THEME.primary,
          THEME.accent,
          THEME.chart.projects,
          THEME.primaryLight,
          THEME.chart.humanEdited,
          THEME.chart.aiOnly,
        ],
        borderColor: [
          "#ffffff",
          "#ffffff",
          "#ffffff",
          "#ffffff",
          "#ffffff",
          "#ffffff",
        ],
        borderWidth: 2,
      },
    ],
  };

  // Sector distribution bar chart
  const sectorLabels = Object.keys(stats.sectorDistribution);
  const sectorValues = Object.values(stats.sectorDistribution);
  const sectorBarData = {
    labels: sectorLabels,
    datasets: [
      {
        label: "Total Issues",
        data: sectorValues,
        backgroundColor: THEME.primary,
        borderRadius: 6,
      },
    ],
  };

  // Heuristic distribution bar chart
  const heuristicsSorted = stats.heuristicStats.distribution;
  const heuristicIssueBarData = {
    labels: heuristicsSorted.map((h) => h.name || `Heuristic ${h.id}`),
    datasets: [
      {
        label: "Issues",
        data: heuristicsSorted.map((h) => h.totalIssues),
        backgroundColor: THEME.accent,
        borderRadius: 6,
      },
    ],
  };

  // Heuristic average scores bar chart
  const heuristicScoreLabels = stats.heuristicScoreAverages.map((h) => h.name);
  const heuristicScoreValues = stats.heuristicScoreAverages.map(
    (h) => h.averageScore
  );
  const heuristicScoreBarData = {
    labels: heuristicScoreLabels,
    datasets: [
      {
        label: "Avg Score",
        data: heuristicScoreValues,
        backgroundColor: THEME.primary,
        borderRadius: 6,
      },
    ],
  };

  // Combined time series line chart
  const combinedLineData = {
    datasets: [
      ...(selectedDataSeries.users
        ? [
            {
              label: "Users",
              data: timeSeriesData.users,
              borderColor: THEME.chart.users,
              backgroundColor: "rgba(185, 74, 47, 0.1)",
              fill: true,
              tension: 0.2,
              hidden: !selectedDataSeries.users,
            },
          ]
        : []),
      ...(selectedDataSeries.reports
        ? [
            {
              label: "Reports",
              data: timeSeriesData.reports,
              borderColor: THEME.chart.reports,
              backgroundColor: "rgba(248, 180, 0, 0.1)",
              fill: true,
              tension: 0.2,
              hidden: !selectedDataSeries.reports,
            },
          ]
        : []),
      ...(selectedDataSeries.projects
        ? [
            {
              label: "Projects",
              data: timeSeriesData.projects,
              borderColor: THEME.chart.projects,
              backgroundColor: "rgba(30, 42, 59, 0.1)",
              fill: true,
              tension: 0.2,
              hidden: !selectedDataSeries.projects,
            },
          ]
        : []),
    ],
  };

  // Line chart options
  const lineChartOptions = {
    responsive: true,
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: timePeriod === "24h" ? ("hour" as const) : ("day" as const),
          tooltipFormat: "MMM d, yyyy, HH:mm",
          displayFormats: {
            hour: "HH:mm",
            day: "MMM d",
          },
        },
        title: {
          display: true,
          text: "Date",
          color: THEME.text,
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Count",
          color: THEME.text,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
    },
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: THEME.text,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: THEME.text,
        bodyColor: THEME.text,
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
      },
    },
  };

  // Bar chart options
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: THEME.text,
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: THEME.text,
        bodyColor: THEME.text,
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          color: THEME.text,
        },
      },
      x: {
        ticks: {
          color: THEME.text,
        },
      },
    },
  };

  // Pie chart options
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: THEME.text,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.9)",
        titleColor: THEME.text,
        bodyColor: THEME.text,
        borderColor: "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
        callbacks: {
          label: (context: any) => {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce(
              (a: number, b: number) => a + b,
              0
            );
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div>
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Image
              src="/images/logo.png"
              alt="UXMust Logo"
              width={120}
              height={40}
              className="w-auto h-8"
            />
          </Link>
          <h1 className="text-xl font-semibold" style={{ color: THEME.text }}>
            Admin panel
          </h1>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <div className="relative w-64">
            <Search
              className="absolute left-2.5 top-2.5 h-4 w-4"
              style={{ color: THEME.muted }}
            />
            <Input
              type="search"
              placeholder="Search users..."
              className="w-full pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderColor: "rgba(0, 0, 0, 0.1)" }}
            />
          </div>
          <Select
            value={timePeriod}
            onValueChange={(value) => {
              setTimePeriod(value);
            }}
          >
            <SelectTrigger
              className="w-40"
              style={{ borderColor: "rgba(0, 0, 0, 0.1)", color: THEME.text }}
            >
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent>
              {TIME_PERIODS.map((period) => (
                <SelectItem key={period.value} value={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  style={{
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    color: THEME.text,
                  }}
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download report</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export dashboard data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Main content */}
      <main className="flex items-center justify-center p-6 lg:px-24">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 w-full"
        >
          <TabsList className="grid grid-cols-4 w-full lg:w-1/2">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2"
              style={{
                color: activeTab === "overview" ? THEME.primary : THEME.text,
                backgroundColor:
                  activeTab === "overview" ? "white" : "transparent",
              }}
            >
              <BarChart className="h-4 w-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center gap-2"
              style={{
                color: activeTab === "users" ? THEME.primary : THEME.text,
                backgroundColor:
                  activeTab === "users" ? "white" : "transparent",
              }}
            >
              <Users className="h-4 w-4" />
              <span>Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="flex items-center gap-2"
              style={{
                color: activeTab === "reports" ? THEME.primary : THEME.text,
                backgroundColor:
                  activeTab === "reports" ? "white" : "transparent",
              }}
            >
              <FileText className="h-4 w-4" />
              <span>Reports</span>
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="flex items-center gap-2"
              style={{
                color: activeTab === "analytics" ? THEME.primary : THEME.text,
                backgroundColor:
                  activeTab === "analytics" ? "white" : "transparent",
              }}
            >
              <LineChart className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border border-gray-300">
                <CardHeader className="pb-2">
                  <CardDescription style={{ color: THEME.muted }}>
                    Total Users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: THEME.text }}
                  >
                    {getFilteredStats?.users || stats.totalUsers}
                  </div>
                  <p className="text-xs" style={{ color: THEME.muted }}>
                    <span style={{ color: THEME.chart.humanEdited }}>
                      +{stats.dateRangeStats.users["24h"]}
                    </span>{" "}
                    in the last 24h
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardHeader className="pb-2">
                  <CardDescription style={{ color: THEME.muted }}>
                    Waiting List
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: THEME.text }}
                  >
                    {stats.totalWaitingList}
                  </div>
                  <p className="text-xs" style={{ color: THEME.muted }}>
                    Potential new users
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardHeader className="pb-2">
                  <CardDescription style={{ color: THEME.muted }}>
                    Projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: THEME.text }}
                  >
                    {getFilteredStats?.projects || stats.totalProjects}
                  </div>
                  <p className="text-xs" style={{ color: THEME.muted }}>
                    <span style={{ color: THEME.chart.humanEdited }}>
                      +{stats.dateRangeStats.projects["24h"]}
                    </span>{" "}
                    in the last 24h
                  </p>
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardHeader className="pb-2">
                  <CardDescription style={{ color: THEME.muted }}>
                    Reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div
                    className="text-2xl font-bold"
                    style={{ color: THEME.text }}
                  >
                    {getFilteredStats?.reports || stats.totalReports}
                  </div>
                  <p className="text-xs" style={{ color: THEME.muted }}>
                    <span style={{ color: THEME.chart.humanEdited }}>
                      +{stats.dateRangeStats.reports["24h"]}
                    </span>{" "}
                    in the last 24h
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Combined Growth Chart */}
            <Card className="border border-gray-300">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle style={{ color: THEME.text }}>
                    Growth Trends
                  </CardTitle>
                  <CardDescription style={{ color: THEME.muted }}>
                    Track users, reports, and projects over time
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-auto"
                      style={{
                        borderColor: "rgba(0, 0, 0, 0.1)",
                        color: THEME.text,
                      }}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      Data Series
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={selectedDataSeries.users}
                      onCheckedChange={(checked) =>
                        setSelectedDataSeries({
                          ...selectedDataSeries,
                          users: !!checked,
                        })
                      }
                    >
                      <span style={{ color: THEME.chart.users }}>● </span>Users
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedDataSeries.reports}
                      onCheckedChange={(checked) =>
                        setSelectedDataSeries({
                          ...selectedDataSeries,
                          reports: !!checked,
                        })
                      }
                    >
                      <span style={{ color: THEME.chart.reports }}>● </span>
                      Reports
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={selectedDataSeries.projects}
                      onCheckedChange={(checked) =>
                        setSelectedDataSeries({
                          ...selectedDataSeries,
                          projects: !!checked,
                        })
                      }
                    >
                      <span style={{ color: THEME.chart.projects }}>● </span>
                      Projects
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="h-[80vh]">
                  <Line data={combinedLineData} options={lineChartOptions} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: THEME.text }}>
                User Management
              </h2>
              <div className="flex items-center gap-2">
                <Select
                  value={userTypeFilter}
                  onValueChange={setUserTypeFilter}
                >
                  <SelectTrigger
                    className="w-40"
                    style={{
                      borderColor: "rgba(0, 0, 0, 0.1)",
                      color: THEME.text,
                    }}
                  >
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Users</SelectItem>
                    <SelectItem value="registered">Registered</SelectItem>
                    <SelectItem value="waitingList">Waiting List</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  style={{
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    color: THEME.text,
                  }}
                >
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </div>
            </div>

            <Card className="border border-gray-300">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow
                      style={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                    >
                      <TableHead style={{ color: THEME.text }}>Type</TableHead>
                      <TableHead style={{ color: THEME.text }}>Name</TableHead>
                      <TableHead style={{ color: THEME.text }}>Email</TableHead>
                      <TableHead style={{ color: THEME.text }}>
                        Date Joined
                      </TableHead>
                      <TableHead style={{ color: THEME.text }}>
                        Last Updated
                      </TableHead>
                      <TableHead style={{ color: THEME.text }}>
                        Reports
                      </TableHead>
                      <TableHead style={{ color: THEME.text }}>
                        Avg Score
                      </TableHead>
                      <TableHead style={{ color: THEME.text }}>
                        Issues
                      </TableHead>
                      <TableHead
                        className="text-right"
                        style={{ color: THEME.text }}
                      >
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={9}
                          className="text-center py-6"
                          style={{ color: THEME.muted }}
                        >
                          No users found matching your criteria
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>
                            <Badge
                              variant={
                                user.type === "registered"
                                  ? "default"
                                  : "secondary"
                              }
                              style={{
                                backgroundColor:
                                  user.type === "registered"
                                    ? THEME.primary
                                    : "rgba(0, 0, 0, 0.1)",
                                color:
                                  user.type === "registered"
                                    ? "white"
                                    : THEME.text,
                              }}
                            >
                              {user.type === "registered" ? "User" : "Waiting"}
                            </Badge>
                          </TableCell>
                          <TableCell style={{ color: THEME.text }}>
                            {user.name ?? "N/A"}
                          </TableCell>
                          <TableCell style={{ color: THEME.text }}>
                            {user.email}
                          </TableCell>
                          <TableCell style={{ color: THEME.text }}>
                            {user.createdAt ? formatDate(user.createdAt) : ""}
                          </TableCell>
                          <TableCell style={{ color: THEME.text }}>
                            {user.type === "registered"
                              ? formatDate(user.updatedAt)
                              : "-"}
                          </TableCell>
                          <TableCell style={{ color: THEME.text }}>
                            {user.totalReports ?? 0}
                          </TableCell>
                          <TableCell style={{ color: THEME.text }}>
                            {user.averageScore?.toFixed?.(2) ?? 0}
                          </TableCell>
                          <TableCell style={{ color: THEME.text }}>
                            {user.totalIssues ?? 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  style={{ color: THEME.primary }}
                                >
                                  Actions
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  View Details
                                </DropdownMenuItem>
                                {user.type === "waitingList" && (
                                  <DropdownMenuItem>
                                    Approve User
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  style={{ color: THEME.error }}
                                >
                                  Delete User
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t p-4">
                <div className="text-sm" style={{ color: THEME.muted }}>
                  Showing <strong>{filteredUsers.length}</strong> of{" "}
                  <strong>{userDetails.length}</strong> users
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    style={{
                      borderColor: "rgba(0, 0, 0, 0.1)",
                      color: THEME.text,
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    style={{
                      borderColor: "rgba(0, 0, 0, 0.1)",
                      color: THEME.text,
                    }}
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-gray-300">
                <CardHeader>
                  <CardTitle style={{ color: THEME.text }}>
                    Sector Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Bar data={sectorBarData} options={barChartOptions} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardHeader>
                  <CardTitle style={{ color: THEME.text }}>
                    Heuristic Issue Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Bar
                      data={heuristicIssueBarData}
                      options={barChartOptions}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-gray-300">
                <CardHeader>
                  <CardTitle style={{ color: THEME.text }}>
                    Heuristic with Most Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.heuristicStats.mostIssues ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className="font-medium"
                          style={{ color: THEME.text }}
                        >
                          Name:
                        </span>
                        <span style={{ color: THEME.text }}>
                          {stats.heuristicStats.mostIssues.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className="font-medium"
                          style={{ color: THEME.text }}
                        >
                          Total Issues:
                        </span>
                        <Badge
                          variant="destructive"
                          className="ml-auto"
                          style={{
                            backgroundColor: THEME.error,
                            color: "white",
                          }}
                        >
                          {stats.heuristicStats.mostIssues.totalIssues}
                        </Badge>
                      </div>
                      <Separator
                        className="my-4"
                        style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
                      />
                      <p className="text-sm" style={{ color: THEME.muted }}>
                        This heuristic has the highest number of issues reported
                        by users, indicating a potential area for improvement.
                      </p>
                    </div>
                  ) : (
                    <p style={{ color: THEME.text }}>No heuristics found.</p>
                  )}
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardHeader>
                  <CardTitle style={{ color: THEME.text }}>
                    Heuristic with Least Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.heuristicStats.leastIssues ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className="font-medium"
                          style={{ color: THEME.text }}
                        >
                          Name:
                        </span>
                        <span style={{ color: THEME.text }}>
                          {stats.heuristicStats.leastIssues.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className="font-medium"
                          style={{ color: THEME.text }}
                        >
                          Total Issues:
                        </span>
                        <Badge
                          variant="default"
                          className="ml-auto"
                          style={{
                            backgroundColor: THEME.chart.humanEdited,
                            color: "white",
                          }}
                        >
                          {stats.heuristicStats.leastIssues.totalIssues}
                        </Badge>
                      </div>
                      <Separator
                        className="my-4"
                        style={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
                      />
                      <p className="text-sm" style={{ color: THEME.muted }}>
                        This heuristic has the lowest number of issues reported,
                        suggesting either good implementation or lower usage.
                      </p>
                    </div>
                  ) : (
                    <p style={{ color: THEME.text }}>No heuristics found.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="border border-gray-300">
              <CardHeader>
                <CardTitle style={{ color: THEME.text }}>
                  Heuristic Average Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <Bar
                    data={heuristicScoreBarData}
                    options={{
                      ...barChartOptions,
                      indexAxis: "y" as const,
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-gray-300">
                <CardHeader>
                  <CardTitle style={{ color: THEME.text }}>
                    User Activity by Page Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {Object.entries(stats.pageTypeDistribution)
                        .sort(([, a], [, b]) => b - a)
                        .map(([pageType, count]) => (
                          <div key={pageType} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span
                                className="font-medium"
                                style={{ color: THEME.text }}
                              >
                                {pageType}
                              </span>
                              <span
                                className="text-sm"
                                style={{ color: THEME.muted }}
                              >
                                {count} issues
                              </span>
                            </div>
                            <div
                              className="h-2 w-full rounded-full overflow-hidden"
                              style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                            >
                              <div
                                className="h-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (count /
                                      Math.max(
                                        ...Object.values(
                                          stats.pageTypeDistribution
                                        )
                                      )) *
                                      100
                                  )}%`,
                                  backgroundColor: THEME.primary,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="border border-gray-300">
                <CardHeader>
                  <CardTitle style={{ color: THEME.text }}>
                    User Activity by Sector
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-4">
                      {Object.entries(stats.sectorDistribution)
                        .sort(([, a], [, b]) => b - a)
                        .map(([sector, count]) => (
                          <div key={sector} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span
                                className="font-medium"
                                style={{ color: THEME.text }}
                              >
                                {sector}
                              </span>
                              <span
                                className="text-sm"
                                style={{ color: THEME.muted }}
                              >
                                {count} issues
                              </span>
                            </div>
                            <div
                              className="h-2 w-full rounded-full overflow-hidden"
                              style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                            >
                              <div
                                className="h-full"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    (count /
                                      Math.max(
                                        ...Object.values(
                                          stats.sectorDistribution
                                        )
                                      )) *
                                      100
                                  )}%`,
                                  backgroundColor: THEME.accent,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
            {/* Distribution Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="border border-gray-300">
                <CardHeader>
                  <CardTitle style={{ color: THEME.text }}>
                    Page Type Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Pie data={pageTypePieData} options={pieChartOptions} />
                  </div>
                </CardContent>
              </Card>
              <Card className="border border-gray-300">
                <CardHeader>
                  <CardTitle style={{ color: THEME.text }}>
                    Human Edited vs AI Only
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <Pie data={humanVsAiPieData} options={pieChartOptions} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
