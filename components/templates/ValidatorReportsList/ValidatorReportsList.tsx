import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import { ReportGroups } from "./ValidatorReportsList.constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { ReportGroupType } from "./ValidatorReportsList.types";
import { useSession } from "next-auth/react";
import { ReportType } from "@/types/report.types";
import { Calendar, ImagePlus, Loader, UserPlus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ConfirmationModal from "@/components/organisms/ConfirmationModal/ConfirmationModal";
import FileUploader from "@/components/organisms/FileUploader/FileUploader";
import { Select } from "@/components/ui/select";
import SelectElement from "@/components/organisms/SelectElement/SelectElement";
import { OptionType } from "@/types/common.types";

const mockUsers: OptionType[] = [
  { label: "User 1 Bisey", value: "id1" },
  { label: "User 2 Bisey", value: "id2" },
  { label: "User 3 Bisey", value: "id3" },
  { label: "User 4 Bisey", value: "id4" },
  { label: "User 5 Bisey", value: "id5" },
  { label: "User 6 Bisey", value: "id6" },
  { label: "User 7 Bisey", value: "id7" },
  { label: "User 8 Bisey", value: "id8" },
];

const ValidatorReportsList = () => {
  const { data: session } = useSession();

  const [selectedGroup, setSelectedGroup] = useState<ReportGroupType>(ReportGroups.ALL);
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<ReportType[]>();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<string>();

  const fetchReports = async () => {
    if (!session?.user?._id) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/reports?userId=${session.user._id}`);
      if (!res.ok) throw new Error("Failed to fetch reports");
      const data = await res.json();

      setReports(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = () => {
    console.log("upload image flow initialized");
  };
  const handleAssignReport = () => {
    console.log("assign report flow initialized");
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <>
      <Card className="border-none shadow-lg bg-white transition-all duration-300 hover:shadow-xl">
        <CardHeader className="p-2">
          <div className="flex items-center justify-between">
            {Object.entries(ReportGroups).map(([key, reportGroup]) => {
              return (
                <div
                  key={key}
                  data-state={selectedGroup.value === reportGroup.value && "active"}
                  onClick={() => setSelectedGroup(reportGroup)}
                  className="p-4 cursor-pointer text-[#B2B2B2] text-lg data-[state=active]:border-b data-[state=active]:border-[#B04E34] data-[state=active]:text-black transition-all duration-200">
                  {reportGroup.label}
                </div>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            {isLoading ? (
              <div className="flex items-center text-sm text-gray-500">
                <Loader className="h-3 w-3 mr-2 animate-spin" />
                Loading reports...
              </div>
            ) : (
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Reports/Websites</TableHead>
                    <TableHead>Contributor</TableHead>
                    <TableHead>Report Generated</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports?.map((report) => (
                    <TableRow
                      key={JSON.stringify(report._id)}
                      className="hover:bg-gray-50 transition-colors duration-200">
                      <TableCell width={600} className="text-gray-500 font-medium max-w-[600px] truncate">
                        <Link href={`/report/${report._id}`}>{report.url}</Link>
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
                          onClick={() => setIsAssignModalOpen(true)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-[#B04E34] transition-colors duration-200 [&_svg]:size-5">
                          <ImagePlus />
                          <span className="sr-only">Upload Image</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsUploadModalOpen(true)}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-[#B04E34] transition-colors duration-200 [&_svg]:size-5">
                          <UserPlus />
                          <span className="sr-only">Assign To Contributor</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Assign Report Dialog */}
      <ConfirmationModal
        title="Upload Screenshot"
        description="Upload screenshot of the website"
        isOpen={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        onConfirm={handleUploadImage}>
        <FileUploader />
      </ConfirmationModal>

      {/* Assign Report Dialog */}
      <ConfirmationModal
        title="Assign Report"
        description="Select a contributor to assign the report"
        isOpen={isUploadModalOpen}
        onCancel={() => setIsUploadModalOpen(false)}
        onConfirm={handleAssignReport}>
        <SelectElement
          label="Conributors"
          options={mockUsers}
          selected={assignTarget ?? ""}
          onValueChange={(optionValue) => setAssignTarget(optionValue)}
        />
      </ConfirmationModal>
    </>
  );
};

export default ValidatorReportsList;
