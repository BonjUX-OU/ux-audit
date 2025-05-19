import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CircleX, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Heuristics, SeverityLevels } from "@/constants/reportIssue.constants";
import clsx from "clsx";
import {
  HeuristicType,
  IssueOrdersType,
  ReportIssueType,
  SeverityLevelKeys,
  SeverityLevelType,
} from "@/types/reportIssue.types";
import { ReportType } from "@/types/report.types";
import { useToast } from "@/hooks/useToast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { IssueRectangleData } from "@/hooks/useDrawRect";
import { base64ToBlob } from "@/helpers/base64toBlob";
import { getHeuristicColor } from "@/helpers/getColorHelper";

type CreateIssueModalProps = {
  isOpen: boolean;
  targetReport: ReportType;
  issueRectangle: IssueRectangleData;
  issueOrders: IssueOrdersType;
  onClose: (isOpen: boolean) => void;
  onSaveIssue: (issue: ReportIssueType) => void;
};

const CreateIsseModal = ({
  isOpen,
  issueOrders,
  targetReport,
  issueRectangle,
  onSaveIssue,
  onClose,
}: CreateIssueModalProps) => {
  const { toast } = useToast();
  const [selectedHeuristic, setSelectedHeuristic] = useState<HeuristicType | null>(null);
  const [issueStep, setIssueStep] = useState<"heuristic" | "details">("heuristic");
  const [newIssueData, setNewIssueData] = useState<ReportIssueType>();
  const [newTag, setNewTag] = useState<string>("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    const { heuristic, description, severityLevel, suggestedFix } = newIssueData || {};
    setIsButtonDisabled(!heuristic || !description || !severityLevel || !suggestedFix);
  }, [newIssueData]);

  const uploadScreenshot = async () => {
    try {
      const blob: Blob = base64ToBlob(issueRectangle.screenshot!);
      if (!blob) {
        throw new Error("Invalid screenshot data");
      }

      const fileName = `issue-${newIssueData?.heuristic?.code}.${newIssueData?.order ?? 1}-${Date.now()}`;
      const file = new File([blob], fileName, { type: blob.type });

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`/api/report/upload-cropped-image?filename=${fileName}`, {
        method: "POST",
        headers: {
          "content-type": file.type,
          "x-filename": file.name,
        },
        body: blob,
      });

      const { url } = await response.json(); // Blob URL
      return url;
    } catch (error) {
      console.error("Error uploading screenshot:", error);
      toast({
        title: "Error",
        description: "Failed to upload the screenshot.",
        variant: "destructive",
      });
      return "";
    }
  };

  const handleContinueToIssue = () => {
    const newIssue: ReportIssueType = {
      report: targetReport,
      heuristic: selectedHeuristic!,
      severityLevel: SeverityLevels.MINOR,
      description: "",
      suggestedFix: "",
      order: issueOrders[selectedHeuristic!.code] + 1,
      snapshotLocation: {
        top: issueRectangle.top,
        left: issueRectangle.left,
        width: issueRectangle.width,
        height: issueRectangle.height,
      },
      croppedImageUrl: "",
      tags: [],
    };

    setNewIssueData(newIssue);
    setIssueStep("details");
  };

  const handleSaveIssue = async () => {
    if (!selectedHeuristic) {
      toast({
        title: "Error",
        description: "Please select a heuristic.",
        variant: "destructive",
      });
      return;
    }

    try {
      const croppedImageUrl = await uploadScreenshot();

      if (!croppedImageUrl) {
        throw new Error("Failed to upload cropped image");
      }

      const response = await fetch("/api/report/issue", {
        method: "POST",
        body: JSON.stringify({
          ...newIssueData,
          croppedImageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save the issue");
      }

      const data = await response.json();
      onSaveIssue(data);
    } catch (error) {
      console.error("Error saving issue:", error);
      toast({
        title: "Error",
        description: "Failed to save the issue.",
        variant: "destructive",
      });
    }
  };

  const handleSevertyLevelSelect = (severityLevelKey: SeverityLevelKeys) => {
    const targetSeverity = SeverityLevels[severityLevelKey];

    setNewIssueData((prev) => ({
      ...prev!,
      severityLevel: targetSeverity,
    }));
  };

  const addNewTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag) {
      setNewIssueData((prev) => ({
        ...prev!,
        tags: [...(prev?.tags || []), newTag],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tag: string) => {
    setNewIssueData((prev) => ({
      ...prev!,
      tags: prev?.tags?.filter((t) => t !== tag),
    }));
  };

  const handleClose = () => {
    setSelectedHeuristic(null);
    setNewIssueData(undefined);
    setNewTag("");
    setIssueStep("heuristic");
    onClose(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 gap-0">
        <DialogHeader className="border-b">
          <DialogTitle></DialogTitle>
          <h3 className="p-4 text-md font-semibold">Select Heuristic Criteria Related to Issue</h3>
        </DialogHeader>

        <div className="p-4 h-[32rem] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {issueStep === "heuristic" ? (
            Heuristics.map((heuristic) => (
              <div
                key={heuristic.code}
                className={clsx(
                  "w-full p-4 border rounded-md my-2 cursor-pointer hover:bg-[#FFF1E0] transition-all duration-100",
                  selectedHeuristic?.code === heuristic.code && "bg-[#FFF1E0] border-[#B04E34]"
                )}
                onClick={() => setSelectedHeuristic(heuristic)}>
                <div className="w-full flex gap-2 items-center mb-1">
                  <span
                    className={`w-6 h-6 text-center rounded-full bg-[${getHeuristicColor(
                      heuristic.code
                    )}] text-white text-md font-medium`}>
                    {heuristic.code}
                  </span>
                  <span className="text-md font-bold">{heuristic.name}</span>
                </div>
                <span className="text-sm font-light text-gray-500">{heuristic.description}</span>
              </div>
            ))
          ) : (
            <div className="flex flex-col gap-4">
              <div className="w-full flex items-center justify-center">
                {issueRectangle && issueRectangle.screenshot && (
                  <img
                    src={issueRectangle.screenshot}
                    alt="Snapshot"
                    style={{ width: 100, border: "1px solid #ccc" }}
                  />
                )}
              </div>
              <div className="w-full text-md">
                <b>Heuristic: </b>
                {newIssueData?.heuristic?.name} ({newIssueData?.heuristic?.code})
              </div>
              <div className="w-full text-md">
                <b>{`Issue ${newIssueData?.heuristic?.code}.${newIssueData?.order ?? 1} description *`}</b>
                <Textarea
                  value={newIssueData?.description}
                  onChange={(e) => setNewIssueData({ ...newIssueData!, description: e.target.value })}
                  className="min-h-[80px] my-2"
                  placeholder="Describe the usability issue you-ve identified..."
                />
              </div>
              <div className="w-full text-md">
                <b>
                  How severe the issue? ({SeverityLevels.MINOR.code}-{SeverityLevels.CRITICAL.code}) *
                </b>
                <RadioGroup onValueChange={handleSevertyLevelSelect}>
                  <div className="flex gap-4 mt-2">
                    {Object.entries(SeverityLevels).map(([key, level]) => (
                      <div key={level.code} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={key}
                          id={`severity-${key}`}
                          className="w-4 h-4 border-gray-400 rounded-full cursor-pointer"
                        />
                        <label htmlFor={`severity-${key}`} className="text-md text-gray-700">
                          {level.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              <div className="w-full text-md">
                <b>
                  Suggested Fix for {newIssueData?.heuristic?.code}.{newIssueData?.order ?? 1}
                </b>
                <Textarea
                  value={newIssueData?.suggestedFix}
                  onChange={(e) => setNewIssueData({ ...newIssueData!, suggestedFix: e.target.value })}
                  className="min-h-[80px] my-2"
                  placeholder="Suggest a fix for the issue..."
                />
              </div>
              <div className="w-full text-md">
                <b>Add Tags</b>
                <div className=" w-full h-[3rem] flex items-center border rounded-md mt-2">
                  <input
                    className="w-[80%] h-full px-4 text-sm outline-none border-none rounded-md"
                    placeholder="ex. Button"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyUp={(e) => addNewTag(e)}
                  />
                  <div
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onClick={() => addNewTag({ key: "Enter" } as any)} // Simulate Enter key press
                    className={clsx("w-[20%] flex items-center gap-2 cursor-pointer", !newTag.length && "opacity-40")}>
                    <Plus className={"h-4 w-4 text-[#B04E43]"} />
                    <span className="text-sm text-[#B04E43]">Add Tag</span>
                  </div>
                </div>
                {newIssueData && newIssueData.tags && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newIssueData.tags.map((tag) => (
                      <Badge
                        variant="outline"
                        key={tag}
                        className="p-2 bg-[#FFF1E0] border-[#B04E34] rounded-lg text-sm font-normal flex items-center gap-2">
                        {tag}
                        <CircleX className="cursor-pointer h-4 w-4" color="#963F28" onClick={() => removeTag(tag)} />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="p-4 border-t">
          {issueStep === "heuristic" ? (
            <Button
              disabled={!selectedHeuristic}
              onClick={handleContinueToIssue}
              className="w-full py-6 bg-[#B04E34] hover:bg-[#963F28] text-white">
              Continue to Add Details
            </Button>
          ) : (
            <Button
              disabled={isButtonDisabled}
              onClick={handleSaveIssue}
              className="w-full py-6 bg-[#B04E34] hover:bg-[#963F28] text-white">
              Add Issue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateIsseModal;
