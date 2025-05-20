import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ReportListItem from "./ReportListItem";
import { FileIcon, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportType } from "@/types/report.types";

type ReportListProps = {
  reports: ReportType[];
  isLoading?: boolean;
  onAddNewReport?: () => void;
  onDeleteReportClick: (report: ReportType) => void;
};

const ReportList = ({ reports, isLoading, onAddNewReport, onDeleteReportClick }: ReportListProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center text-sm text-gray-500">
        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
        Loading reports...
      </div>
    );
  }

  if (!reports.length && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-lg shadow-sm">
        <FileIcon className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-center text-lg font-medium mb-2">No reports yet</p>
        <p className="text-center text-gray-400 mb-6">Generate your first report using the form above</p>
        {onAddNewReport && (
          <Button
            onClick={() => document.querySelector("form")?.scrollIntoView({ behavior: "smooth" })}
            className="bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200">
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        )}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead>Report URL</TableHead>
          <TableHead>Date Created</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[120px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {reports.map((report) => (
          <ReportListItem key={report._id} report={report} onDeleteReportClick={onDeleteReportClick} />
        ))}
      </TableBody>
    </Table>
  );
};

export default ReportList;
