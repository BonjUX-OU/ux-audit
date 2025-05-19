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
import { UserType } from "@/types/user.types";
import { ReportStatus } from "@/components/organisms/ReportList/ReportList.types";

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
  const [assignTarget, setAssignTarget] = useState<UserType["_id"] | null>();
  const [selectedReportId, setSelectedReportId] = useState<string>();
  const [contributors, setContributors] = useState<UserType[]>();
  const [mappedContributors, setMappedContributors] = useState<OptionType[]>();

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

  const fetchContributors = async () => {
    if (!session?.user?._id) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/user/${session.user.role}`);

      if (!res.ok) throw new Error("Failed to fetch reports");

      const data = (await res.json()) as UserType[];

      setContributors(data);

      const mappedOptionType = data.map((user) => ({ value: user._id, label: user.name }));

      setMappedContributors(mappedOptionType as OptionType[]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadImage = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsUploadModalOpen(true);
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

  const onAssignReportConfirm = async () => {
    const targetUser = contributors?.filter((contributor) => contributor._id === assignTarget)[0];

    const payload: Pick<ReportType, "assignedTo" | "status"> = {
      assignedTo: targetUser,
      status: ReportStatus.Assigned,
    };

    const response = await fetch(`/api/report?id=${selectedReportId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to update report");
    }

    const data = await response.json();

    const newReports = [...reports!.filter((report) => report._id !== data._id), data];

    setReports(newReports);

    handleUpdateReportSuccess();
  };

  useEffect(() => {
    if (selectedGroup === ReportGroups.ALL) {
      fetchReports();
    } else if (selectedGroup && selectedGroup !== ReportGroups.ALL) {
      const filteredData = reports?.filter((report) => report.status === selectedGroup.status);
      setFilteredByStatusReports(filteredData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroup]);

  useEffect(() => {
    fetchContributors();
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
        onCancel={() => {
          setAssignTarget(null);
          setIsAssignModalOpen(false);
        }}
        onConfirm={onAssignReportConfirm}>
        {mappedContributors && (
          <div className="min-h-[10rem]">
            <SelectElement
              label="Conributors"
              options={mappedContributors}
              selected={assignTarget ?? ""}
              onValueChange={(optionValue) => setAssignTarget(optionValue)}
            />
          </div>
        )}
      </ConfirmationModal>
    </>
  );
});

ValidatorReportsList.displayName = "ValidatorReportsList";

export default ValidatorReportsList;
