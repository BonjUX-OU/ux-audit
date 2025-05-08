import axios from "axios";
import { ChangeEvent, useState } from "react";
import React from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

const FileUploader = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [baseSmth, setBaseSmth] = useState<string>("");

  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const consoleTestFunc = () => {
    console.log("ok!");
  };

  const handleFileUpload = async () => {
    if (!file) return;

    setStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/report/upload-file", {
        method: "POST",
        body: formData,
      });

      const data = response.json();
      // setBaseSmth(data.base64);

      console.log(response);

      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="space-y-4">
      <input type="file" onChange={handleFileChange} />

      {file && (
        <div className="mb4-4 text-sm">
          <p>File name: {file.name}</p>
          <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
          <p>Type: {file.type}</p>
        </div>
      )}

      <img src={baseSmth}></img>
      {status === "uploading" && (
        <div>
          <p>{uploadProgress}</p>
        </div>
      )}

      {file && status !== "uploading" && <button onClick={handleFileUpload}>Upload</button>}

      {status === "success" && <p className="text-sm text-green-600">File Uploaded Successfully!</p>}

      {status === "error" && <p className="text-sm text-red-600">Upload Failed. Please try again.</p>}
    </div>
  );
};

export default FileUploader;
