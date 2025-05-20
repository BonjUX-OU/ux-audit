import React from "react";
import { TableRow, TableCell } from "@/components/ui/table";
import Link from "next/link";
import { Calendar, Check, ImagePlus, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportType } from "@/types/report.types";
import { ReportStatus } from "@/components/organisms/ReportList/ReportList.types";

type ValidatorReportListTableRowsProps = {
  reports: ReportType[];
  handleUploadImage: (reportId: string) => void;
  handleAssignReport: (reportId: string) => void;
  handleCompleteReport: (reportId: string) => void;
};

const ValidatorReportListTableRows = ({
  reports,
  handleAssignReport,
  handleUploadImage,
  handleCompleteReport,
}: ValidatorReportListTableRowsProps) => {
  return reports?.map((report) => (
    <TableRow key={JSON.stringify(report._id)} className="hover:bg-gray-50 transition-colors duration-200">
      <TableCell width={600} className="text-gray-500 font-medium max-w-[600px] truncate">
        <Link href={`/report/${report._id}/edit`}>{report.url}</Link>
      </TableCell>
      <TableCell>{report.assignedTo?.name ?? "Not Assigned"}</TableCell>
      <TableCell width={200}>
        <div className="flex items-center text-gray-500">
          <Calendar className="h-3 w-3 mr-2 text-gray-400" />
          {report.createdAt ? new Date(report.createdAt!).toLocaleDateString() : "-"}
        </div>
      </TableCell>
      <TableCell>
        <span>{report.score ?? "-"}</span>
      </TableCell>
      <TableCell>
        <span>{report.status ?? "-"}</span>
      </TableCell>
      <TableCell className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleUploadImage(report._id!)}
          className="h-8 w-8 p-0 text-gray-400 hover:text-[#B04E34] transition-colors duration-200 [&_svg]:size-5">
          <ImagePlus />
          <span className="sr-only">Upload Image</span>
        </Button>
        {report.status === ReportStatus.Unassigned && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleAssignReport(report._id!)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-[#B04E34] transition-colors duration-200 [&_svg]:size-5">
            <UserPlus />
            <span className="sr-only">Assign To Contributor</span>
          </Button>
        )}
        {report.status === ReportStatus.InReview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleCompleteReport(report._id!)}
            className="h-8 w-8 p-0 text-gray-400 hover:text-[#B04E34] transition-colors duration-200 [&_svg]:size-5">
            <Check />
            <span className="sr-only">Complete Analysis</span>
          </Button>
        )}
      </TableCell>
    </TableRow>
  ));
};

export default ValidatorReportListTableRows;
