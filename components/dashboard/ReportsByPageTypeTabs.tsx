// components/dashboard/ReportsByPageTypeTabs.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import ComparisonScale from "./ComparisonScale";
import ReportsTable from "./ReportsTable";
import type { AnalysisReport } from "@/types/dashboard";

export default function ReportsByPageTypeTabs({
  grouped,
  loading,
  onDelete,
  scrollToForm,
}: {
  grouped: Record<string, AnalysisReport[]>;
  loading: boolean;
  onDelete: (r: AnalysisReport) => void;
  scrollToForm: () => void;
}) {
  const pageTypes = Object.keys(grouped).sort();
  if (!pageTypes.length && !loading) {
    return (
      <div className="flex flex-col items-center py-12 text-gray-500">
        <FolderPlus className="h-16 w-16 mb-4" />
        <p className="font-medium mb-2">No reports in this project</p>
        <p className="text-gray-400 mb-6">
          Generate your first report for this project
        </p>
        <Button onClick={scrollToForm} className="bg-[#B04E34] text-white">
          Create Report
        </Button>
      </div>
    );
  }

  return (
    <Tabs defaultValue={pageTypes[0]}>
      <TabsList className="mb-4 bg-white rounded-lg p-1 shadow-md">
        {pageTypes.map((pt) => (
          <TabsTrigger
            key={pt}
            value={pt}
            className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            {pt}{" "}
            <Badge variant="outline" className="ml-2 bg-white">
              {grouped[pt].length}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      {pageTypes.map((pt) => (
        <TabsContent key={pt} value={pt}>
          <ComparisonScale reports={grouped[pt]} />
          <div className="mt-4 h-[350px]">
            <ReportsTable
              reports={grouped[pt]}
              loading={loading}
              onDelete={onDelete}
            />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
