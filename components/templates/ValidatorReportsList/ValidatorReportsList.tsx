import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ReportGroups } from "./ValidatorReportsList.constants";
import { ScrollArea } from "@/components/ui/scroll-area";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { ReportGroupType } from "./ValidatorReportsList.types";
import { useSession } from "next-auth/react";
import { ReportType } from "@/types/report.types";
import { Loader } from "lucide-react";
import ConfirmationModal from "@/components/organisms/ConfirmationModal/ConfirmationModal";
import FileUploader from "@/components/organisms/FileUploader/FileUploader";
import SelectElement from "@/components/organisms/SelectElement/SelectElement";
import { OptionType } from "@/types/common.types";
// import { ReportStatus } from "@/components/organisms/ReportList/ReportList.types";
import ValidatorReportListTableRows from "./ValidatorReportListTableRows";

// Get the contributers from database and list on dropdown.
//
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

export type ValidatorReportsListHandle = {
  fetchReports: () => void;
};

const ValidatorReportsList = forwardRef((props, ref) => {
  const { data: session } = useSession();

  const [selectedGroup, setSelectedGroup] = useState<ReportGroupType>(ReportGroups.ALL);
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<ReportType[]>();
  const [filteredByStatusReports, setFilteredByStatusReports] = useState<ReportType[]>();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [assignTarget, setAssignTarget] = useState<string>();
  const [selectedReportId, setSelectedReportId] = useState<string>();

  // Expose the function to parent via ref
  useImperativeHandle(ref, () => ({
    fetchReports,
  }));

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

  // const fetchReportsByFilter = async () => {
  //   if (!session?.user?._id) return;
  //   setIsLoading(true);
  //   try {
  //     const res = await fetch("/api/user/reports", {
  //       method: "POST",
  //       body: JSON.stringify({
  //         userId: session.user._id,
  //         reportStatus: ReportStatus.NotStarted,
  //         page: { pageNumber: 1, pageItemsCount: 1 },
  //       }),
  //     });
  //     if (!res.ok) throw new Error("Failed to fetch reports");
  //     const data = await res.json();

  //     setReports(data);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleUploadImage = () => {
    console.log("upload image flow initialized");
  };

  const handleAssignReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsAssignModalOpen(true);
  };

  const handleUpdateReportSuccess = async () => {
    setIsUploadModalOpen(false);
    setIsAssignModalOpen(false);
    setAssignTarget(undefined);
    setSelectedReportId(undefined);
    setSelectedGroup(ReportGroups.ALL);
    await fetchReports();
  };

  useEffect(() => {
    if (selectedGroup === ReportGroups.ALL) {
      fetchReports();
    } else if (selectedGroup && selectedGroup !== ReportGroups.ALL) {
      const filteredData = reports?.filter((report) => report.status === selectedGroup.status);
      setFilteredByStatusReports(filteredData);
    }
  }, [selectedGroup]);

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
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <ValidatorReportListTableRows
                    reports={selectedGroup === ReportGroups.ALL ? reports! : filteredByStatusReports!}
                    handleUploadImage={handleUploadImage}
                    handleAssignReport={handleAssignReport}
                  />
                </TableBody>
              </Table>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Upload Report Image Dialog */}
      {isUploadModalOpen && (
        <FileUploader
          isOpen
          targetReportId={selectedReportId!}
          onSuccess={handleUpdateReportSuccess}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}

      {/* Assign Report Dialog */}
      <ConfirmationModal
        title="Assign Report"
        description="Select a contributor to assign the report"
        isOpen={isAssignModalOpen}
        onCancel={() => setIsAssignModalOpen(false)}
        onConfirm={() => setIsAssignModalOpen(false)}>
        <SelectElement
          label="Conributors"
          options={mockUsers}
          selected={assignTarget ?? ""}
          onValueChange={(optionValue) => setAssignTarget(optionValue)}
        />
      </ConfirmationModal>
    </>
  );
});

ValidatorReportsList.displayName = "ValidatorReportsList";

export default ValidatorReportsList;
