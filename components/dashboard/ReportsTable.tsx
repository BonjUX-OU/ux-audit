// components/dashboard/ReportsTable.tsx
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, ExternalLink, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getRatingColor, getRatingLabel } from "@/utils/rating";
import type { AnalysisReport } from "@/types/dashboard";

export default function ReportsTable({
  reports,
  loading,
  onDelete,
}: {
  reports: AnalysisReport[];
  loading: boolean;
  onDelete: (r: AnalysisReport) => void;
}) {
  return (
    <div>
      {loading && (
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <Loader2 className="animate-spin mr-2 h-4 w-4" /> Loading reports...
        </div>
      )}
      <ScrollArea className="h-[48vh]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>URL</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Project</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((rep) => (
              <TableRow key={rep._id}>
                <TableCell className="truncate max-w-[300px] font-medium">
                  <Link href={`/report/${rep._id}`}>{rep.url}</Link>
                </TableCell>
                <TableCell className="flex items-center text-gray-500">
                  <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                  {new Date(rep.createdAt!).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    className={`${getRatingColor(rep.overallScore)} shadow-sm`}
                  >
                    {getRatingLabel(rep.overallScore)}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-600">
                  {rep.project.name}
                </TableCell>
                <TableCell className="flex space-x-1">
                  <Link href={`/report/${rep._id}`}>
                    <Button variant="ghost" size="sm" className="p-0">
                      <ExternalLink />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0"
                    onClick={() => onDelete(rep)}
                  >
                    <Trash2 />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
