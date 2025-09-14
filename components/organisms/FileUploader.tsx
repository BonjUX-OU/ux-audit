import { FormEvent, useRef, useState } from "react";

import type { PutBlobResult } from "@vercel/blob";
import clsx from "clsx";
import { Plus } from "lucide-react";

import { useUI } from "@/providers/UIProvider";
import { ReportType } from "@/types/report.types";

import { Button } from "../atoms/Button";
import { Dialog } from "../atoms/Dialog";

type FileUploaderProps = {
  isOpen: boolean;
  targetReportId: string;
  onClose: (isOpen: boolean) => void;
  onSuccess: () => void;
};

const FileUploader = ({ isOpen, targetReportId, onClose, onSuccess }: FileUploaderProps) => {
  const { notify, setLoading } = useUI();
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

    notify("success", "Image added to target report");

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

      // Create a sanitized file with a clean name if needed
      const sanitizedFile = new File(
        [await file.arrayBuffer()],
        file.name.replace(/[^\x00-\x7F]/g, "").replace(/[^\w\s.-]/g, ""),
        { type: file.type },
      );

      const formData = new FormData();
      formData.append("file", sanitizedFile);

      // Thoroughly sanitize the targetReportId - remove ALL non-ASCII characters
      const sanitizedReportId = targetReportId.replace(/[^\x00-\x7F]/g, "");
      const encodedFilename = encodeURIComponent(sanitizedReportId);

      const response = await fetch(`/api/report/upload?filename=${encodedFilename}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        notify(
          "error",
          response.status === 413
            ? "Image upload failed because file size is too large"
            : errorText,
        );
        console.error("Error response:", errorText);
        throw new Error(`Failed to upload file: ${errorText}`);
      }

      const newBlob = (await response.json()) as PutBlobResult;
      notify("success", "Image uploaded successfully!");
      updateReport(newBlob.url);
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <Dialog.Content className="rounded-xl border-none bg-white shadow-2xl sm:max-w-sm">
        <Dialog.Header>
          <Dialog.Title className={"text-lg"}>Upload Screenshot</Dialog.Title>
          <Dialog.Description className={isLoading ? "hidden" : ""}>
            Choose the screenshot image of the target website
          </Dialog.Description>
        </Dialog.Header>
        {isLoading && (
          <div className="z-50 flex h-full w-full items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center">
              <div className="border-primary h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
              <p className="mt-4 text-lg font-medium text-gray-700">Uploading image...</p>
            </div>
          </div>
        )}
        <form
          onSubmit={handleSubmitImage}
          className={clsx("flex w-full flex-col gap-2", isLoading && "hidden")}>
          <div
            className="mt-2 flex h-[3rem] w-full items-center justify-between rounded-md border"
            onClick={() => inputFileRef.current?.click()}>
            <input
              className="h-full w-[75%] rounded-md border-none px-4 text-sm outline-none"
              placeholder="Upload your file"
              type="text"
              readOnly
              value={fileName}
            />
            <div className="flex w-auto cursor-pointer items-center gap-2 px-4">
              <Plus className={"text-primary h-4 w-4"} />
              <span className="text-primary text-sm">Upload</span>
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
          <Button type="submit" className="mt-4 w-full">
            Upload
          </Button>
        </form>
      </Dialog.Content>
    </Dialog>
  );
};

export default FileUploader;
