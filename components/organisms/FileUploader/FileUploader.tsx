// pages/index.tsx
import type { PutBlobResult } from "@vercel/blob";
// import { put } from "@vercel/blob";
import { FormEvent, useRef, useState } from "react";

const FileUploader = () => {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  const handleSubmitImage = async (event: FormEvent) => {
    event.preventDefault();

    if (!inputFileRef.current?.files) {
      throw new Error("No file selected");
    }

    const file = inputFileRef.current.files[0];

    const response = await fetch(`/api/report/upload?filename=${file.name}`, {
      method: "POST",
      body: file,
    });

    const newBlob = (await response.json()) as PutBlobResult;

    setBlob(newBlob);
  };

  return (
    <>
      <form onSubmit={handleSubmitImage}>
        <label htmlFor="image">Image</label>
        <input name="file" id="image" ref={inputFileRef} type="file" required />
        <button>Upload</button>
      </form>
      {blob && (
        <div>
          Blob url: <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </>
  );
};

export default FileUploader;
