import { NextRequest, NextResponse } from 'next/server';

// Convert a file to base64 string
const convertImagetoBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
  
      fileReader.readAsDataURL(file);
  
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
  
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };


export async function POST(req: NextRequest) {
    const formData = await req.formData();

    const files = formData.getAll('files') as File[];

    const fileToStorage = files[0];

    const base64 = await convertImagetoBase64(fileToStorage as File);

    return NextResponse.json({ message: 'Files Created' });
}