"use client";

import { useRef, useState } from "react";

import { upload } from "@vercel/blob/client";
import { Plus } from "lucide-react";

import { useUI } from "@/providers/UIProvider";
import { ReportType } from "@/types/report.types";

import { Button } from "../atoms/Button";
import { Dialog } from "../atoms/Dialog";

type ImageUploaderProps = {
  isOpen: boolean;
  targetReportId: string;
  onClose: (isOpen: boolean) => void;
  onSuccess: (param?: string) => void;
};

export default function ImageUploader({
  isOpen,
  targetReportId,
  onClose,
  onSuccess,
}: ImageUploaderProps) {
  const { notify, setLoading } = useUI();
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
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

    setLoading(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

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

      notify("success", "Image uploaded successfully!");
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
          <Dialog.Description>Choose the screenshot image of the target website</Dialog.Description>
        </Dialog.Header>
        <form onSubmit={handleSubmit} className={"flex w-full flex-col gap-2"}>
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
          <Button type="submit" className="bg-primary mt-4 w-full text-white">
            Upload
          </Button>
        </form>
      </Dialog.Content>
    </Dialog>
  );
}
