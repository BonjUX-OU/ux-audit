import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { Calendar, ExternalLink, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getRatingColor, getRatingLabel } from "./ReportList.helpers";
import { ReportType } from "@/types/report.types";
import { ReportStatus } from "./ReportList.types";
import { useSession } from "next-auth/react";
import { UserRoleType } from "@/types/user.types";

type ReportListItemProps = {
  report: ReportType;
  onDeleteReportClick: (report: ReportType) => void;
};

const ReportListItem = ({ report, onDeleteReportClick }: ReportListItemProps) => {
  const { data: session } = useSession();

  return (
    <TableRow className="hover:bg-gray-50 transition-colors duration-200">
      <TableCell className="font-medium max-w-[300px] truncate">
        <Link href={`/report/${report._id}`}>{report.url}</Link>
      </TableCell>
      <TableCell className="text-gray-500">
        <div className="flex items-center">
          <Calendar className="h-3 w-3 mr-2 text-gray-400" />
          {new Date(report.createdAt!).toLocaleDateString()}
        </div>
      </TableCell>
      <TableCell>
        <Badge
          className={`${getRatingColor(report.score ?? 100)} hover:${getRatingColor(
            report.score ?? 100
          )} shadow-sm transition-all duration-200`}>
          {getRatingLabel(report.score ?? 100)}
        </Badge>
      </TableCell>
      <TableCell className="text-gray-600">{report.project.name}</TableCell>
      <TableCell className="text-gray-600">
        {report.status === ReportStatus.Completed ? report.status : ReportStatus.InProgres}
      </TableCell>
      <TableCell className="flex space-x-1">
        {session?.user?.role === UserRoleType.Contributor && (
          <Link href={`/report/${report._id}/edit`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-[#FFF1E0] hover:text-[#B04E34] transition-colors duration-200">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">View Report</span>
            </Button>
          </Link>
        )}
        {session?.user?.role === UserRoleType.Customer && report.status === ReportStatus.Completed && (
          <Link href={`/report/${report._id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 hover:bg-[#FFF1E0] hover:text-[#B04E34] transition-colors duration-200">
              <ExternalLink className="h-4 w-4" />
              <span className="sr-only">View Report</span>
            </Button>
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
          onClick={() => onDeleteReportClick(report)}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete Report</span>
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ReportListItem;
