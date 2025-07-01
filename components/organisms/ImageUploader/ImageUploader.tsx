'use client';

import { useRef, useState } from 'react';
import { upload } from '@vercel/blob/client';
import { type PutBlobResult } from '@vercel/blob';
import { zIndex } from 'html2canvas/dist/types/css/property-descriptors/z-index';

type AvatarUploaderProps = {
  title?: string;
  uploadUrl?: string;
  onUploadComplete?: (result: PutBlobResult) => void;
};

export default function ImageUploader({
  title = 'Upload Your Avatar',
  uploadUrl = '/api/report/upload',
  onUploadComplete,
}: AvatarUploaderProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [blob, setBlob] = useState<PutBlobResult | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const file = inputFileRef.current?.files?.[0];
    if (!file) return;

    const newBlob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: uploadUrl,
    });

    setBlob(newBlob);
    if (onUploadComplete) {
      onUploadComplete(newBlob);
    }
  };

  return (
    <div style={{width:"100vw",height:"100vh",display:"flex",justifyContent:"center",alignItems:"center",zIndex:"9999"}}>
      <h1>{title}</h1>

      <form onSubmit={handleSubmit}>
        <input name="file" ref={inputFileRef} type="file" required />
        <button type="submit">Upload</button>
      </form>

      {blob && (
        <div>
          Blob URL: <a href={blob.url}>{blob.url}</a>
        </div>
      )}
    </div>
  );
}
