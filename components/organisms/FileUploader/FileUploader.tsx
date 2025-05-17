import { FormEvent, useRef, useState } from "react";
import type { PutBlobResult } from "@vercel/blob";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { ReportType } from "@/types/report.types";

type FileUploaderProps = {
  isOpen: boolean;
  targetReportId: string;
  onClose: (isOpen: boolean) => void;
  onSuccess: () => void;
};

const FileUploader = ({ isOpen, targetReportId, onClose, onSuccess }: FileUploaderProps) => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const updateReport = async (imageUrl: string) => {
    const payload: Pick<ReportType, "screenshotImgUrl"> = {
      screenshotImgUrl: imageUrl,
    };

    const response = await fetch(`/api/report?id=${targetReportId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Failed to update report");
    }

    onSuccess();
  };

  const handleSubmitImage = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      if (!inputFileRef.current?.files) {
        throw new Error("No file selected");
      }

      const file = inputFileRef.current.files[0];

      const response = await fetch(`/api/report/upload?filename=${targetReportId}`, {
        method: "POST",
        body: file,
      });

      const newBlob = (await response.json()) as PutBlobResult;

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      updateReport(newBlob.url);
    } catch (error) {
      console.error("Error uploading file:", error);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm bg-white shadow-2xl border-none rounded-xl">
        <DialogHeader>
          <DialogTitle className={"text-lg"}>Upload Screenshot</DialogTitle>
          <DialogDescription className={isLoading ? "hidden" : ""}>
            Choose the screenshot image of the target website
          </DialogDescription>
        </DialogHeader>
        {isLoading && (
          <div className="w-full h-full flex items-center justify-center bg-gray-50 z-50">
            <div className="flex flex-col items-center">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#B04E34] border-t-transparent"></div>
              <p className="mt-4 text-lg font-medium text-gray-700">Uploading image...</p>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmitImage} className={clsx("flex flex-col gap-2 w-full", isLoading && "hidden")}>
          <div
            className=" w-full h-[3rem] flex justify-between items-center border rounded-md mt-2"
            onClick={() => inputFileRef.current?.click()}>
            <input
              className="w-[75%] h-full px-4 text-sm outline-none border-none rounded-md"
              placeholder="Upload your file"
              type="text"
              readOnly
              value={fileName}
            />
            <div className="w-auto px-4 flex items-center gap-2 cursor-pointer">
              <Plus className={"h-4 w-4 text-[#B04E43]"} />
              <span className="text-sm text-[#B04E43]">Upload</span>
            </div>
          </div>
          <input
            className="d-none"
            name="file"
            id="image"
            ref={inputFileRef}
            type="file"
            required
            hidden
            onChange={(e) => {
              if (e.target.files) {
                setFileName(e.target.files[0].name);
              }
            }}
          />
          <Button type="submit" className="w-full mt-4 bg-[#B04E43] text-white">
            Upload
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploader;
