import { MultiSelect } from "@/components/organisms/MultiSelect/MultiSelect";
import SelectElement from "@/components/organisms/SelectElement/SelectElement";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/useToast";
import { OptionType } from "@/types/common.types";
import { ProjectType } from "@/types/project.types";
import { ReportType } from "@/types/report.types";
import { Globe } from "lucide-react";
import { useSession } from "next-auth/react";
import { FormEvent, useEffect, useState } from "react";

type RequestReportBarProps = {
  project?: ProjectType | null;
  onRequestComplete: () => void;
};

const RequestReportBar = ({ project, onRequestComplete }: RequestReportBarProps) => {
  const { data: session } = useSession();
  const { toast } = useToast();

  const [url, setUrl] = useState("");
  const [sectorOptions, setSectorOptions] = useState<OptionType[]>([]);
  const [pageTypeOptions, setPageTypeOptions] = useState<OptionType[]>([]);
  const [customerIssues, setCustomerIssues] = useState<OptionType[]>([]);

  const [sector, setSector] = useState("");
  const [pageType, setPageType] = useState("");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const getConstants = async () => {
    const response = await fetch(`/api/constants?target=customerIssues`);
    const data = await response.json();

    setCustomerIssues(data.customerIssues);
    setSectorOptions(data.sectorOptions);
    setPageTypeOptions(data.pageTypeOptions);
  };

  useEffect(() => {
    getConstants();
  }, []);

  const createUntitledProject = async (): Promise<ProjectType> => {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Untitled Project",
        description: "",
      }),
    });

    if (!response.ok) {
      throw new Error("Error creating untitled project");
    }
    return response.json();
  };

  const handleRequestReport = async (e: FormEvent) => {
    e.preventDefault();

    // TODO: Check if the user allowed to request report - userAllowedTo analyze

    if (!url.trim()) return;
    if (!pageType) {
      toast({ description: "Please select Page Type", variant: "destructive" });
      return;
    } else if (session?.user?.role !== "customer" && !sector) {
      toast({ description: "Please select Sector", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      let targetProject = !project ? await createUntitledProject() : project;

      const payload: ReportType = {
        createdBy: session?.user,
        project: targetProject,
        pageType,
        url,
        status: "unassigned",
        predefinedIssues: selectedIssues,
      };

      const createdReport = await fetch("/api/report/demand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await createdReport.json();

      console.log("Report created", data);

      toast({ title: "Success!", description: "Your request has been received successfully", variant: "success" });

      onRequestComplete();

      // TODO: After an empty report created on server
      //   - Add the recently created report to the reports state (FE)
      //   - Scrap the given URL on server and add the document string to the related report (BE)
      //   - Next steps will be discussed and decided
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-lg font-medium mb-4">Request Report</h3>
      <form onSubmit={handleRequestReport}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-5">
            <label className="block text-sm font-medium mb-1.5 ">Page URL</label>
            <div className="relative">
              <Input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
                className="pl-9 shadow-sm focus:ring-2 focus:ring-[#B04E34] focus:ring-opacity-50 transition-all duration-200"
              />
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          {/* Sector */}
          {session?.user?.role !== "customer" && (
            <div className="md:col-span-2">
              <SelectElement
                label="Sector"
                placeholder="Select Sector"
                options={sectorOptions}
                selected={sector}
                onValueChange={setSector}
              />
            </div>
          )}

          {/* Page Type */}
          <div className="md:col-span-2">
            <SelectElement
              label="Page Type"
              placeholder="Select Page Type"
              options={pageTypeOptions}
              selected={pageType}
              onValueChange={setPageType}
            />
          </div>

          {/* Issues */}
          {session?.user?.role === "customer" && (
            <div className="md:col-span-3">
              <MultiSelect
                label="Issues"
                placeholder="Select the issues"
                options={customerIssues}
                selected={selectedIssues}
                onChange={setSelectedIssues}
              />
            </div>
          )}

          {/* Generate Button */}
          <div className="md:col-span-2">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#B04E34] hover:bg-[#963F28] text-white shadow-md hover:shadow-lg transition-all duration-200">
              {session?.user?.role === "customer" ? "Request Report" : "Start Analysing"}
            </Button>
          </div>
        </div>

        {/* Additional Notes */}
        <div className="grid grid-cols-1 md:grid-cols-12 mt-4">
          <div className="md:col-span-12">
            <label className="block text-sm font-medium mb-1.5">
              Additional Notes <span className="font-normal">(Optional)</span>
            </label>
            <Textarea
              placeholder="Please explain your problem more in detail if you have anything"
              rows={3}
              style={{ resize: "none" }}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default RequestReportBar;
