"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
// import { type PutBlobResult } from "@vercel/blob";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { ReportType } from "@/types/report.types";
import { useToast } from "@/hooks/useToast";
import clsx from "clsx";

type ImageUploaderProps = {
  isOpen: boolean;
  targetReportId: string;
  onClose: (isOpen: boolean) => void;
  onSuccess: (param?: string) => void;
};

export default function ImageUploader({ isOpen, targetReportId, onClose, onSuccess }: ImageUploaderProps) {
  const { toast } = useToast();
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

    toast({ title: "Success", description: "Image added to target report" });

    onSuccess();

    setIsLoading(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const file = inputFileRef.current?.files?.[0];
      if (!file) return;

      // Rename the file
      const newFileName = `${file.name.split(".")[0]}_${new Date().getTime().toString()}.${file.name.split(".")[1]}`;
      const renamedFile = new File([file], newFileName, { type: file.type });

      const newBlob = await upload(renamedFile.name, file, {
        access: "public",
        handleUploadUrl: "/api/report/upload",
      });

      await updateReport(newBlob.url);

      if (onSuccess) {
        onSuccess(newBlob.url);
      }

      toast({ title: "Success", description: "Image uploaded successfully!" });
    } catch (error) {
      console.error("Error uploading file:", error);
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
        <form onSubmit={handleSubmit} className={clsx("flex flex-col gap-2 w-full", isLoading && "hidden")}>
          <div
            className=" w-full h-12 flex justify-between items-center border rounded-md mt-2"
            onClick={() => inputFileRef.current?.click()}>
            <input
              className="w-[75%] h-full px-4 text-sm outline-hidden border-none rounded-md"
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

          {/* <input name="file" ref={inputFileRef} type="file" required />
          <button type="submit">Upload</button> */}
        </form>
      </DialogContent>
    </Dialog>
  );
}
