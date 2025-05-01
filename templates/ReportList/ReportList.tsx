import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AnalysisReport } from "./ReportList.types";
import ReportListItem from "./ReportListItem";
import { FileIcon } from "lucide-react";

type ReportListProps = {
  reports: AnalysisReport[];
  onDeleteReportClick: (report: AnalysisReport) => void;
};

const ReportList = ({ reports, onDeleteReportClick }: ReportListProps) => {
  if (!reports.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-lg shadow-sm">
        <FileIcon className="h-16 w-16 mb-4 text-gray-300" />
        <p className="text-center text-lg font-medium mb-2">No reports yet</p>
        <p className="text-center text-gray-400 mb-6">Generate your first report using the form above</p>
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
