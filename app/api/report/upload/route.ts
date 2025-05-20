// app/api/report/upload/route.ts
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

// export async function POST(request: Request): Promise<NextResponse> {
//   const { searchParams } = new URL(request.url);
//   const filename = searchParams.get("filename");

//   const blob = await put(filename!, request.body!, {
//     access: "public",
//     allowOverwrite: true,
//   });

//   return NextResponse.json(blob);
// }

export async function PUT(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as File;
  const blob = await put(file.name, file, {
    access: "public",
    addRandomSuffix: true,
    allowOverwrite: true,
  });

  return Response.json(blob);
}

export async function POST(request: Request) {
  try {
    // Sanitize the URL and parameters
    const url = new URL(request.url);
    const rawFilename = url.searchParams.get("filename") || "unnamed-file";

    // Thorough sanitization - remove ALL non-ASCII characters and then restrict to safe chars
    const sanitizedFilename = rawFilename
      .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII chars
      .replace(/[^\w-]/g, ""); // Keep only alphanumeric, underscore and hyphen

    console.log("Processing upload for:", sanitizedFilename);

    // Process form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Extract file content as array buffer to ensure clean bytes
    const fileBuffer = await file.arrayBuffer();

    // Get clean extension (ASCII only)
    const filenameParts = file.name.split(".");
    const extension = filenameParts.length > 1 ? filenameParts.pop()?.replace(/[^\x00-\x7F]/g, "") : "bin";

    // Create final safe filename
    const finalFilename = `${sanitizedFilename}-${Date.now()}.${extension}`;
    console.log("Final filename:", finalFilename);

    // Create a clean Blob for upload
    const cleanBlob = new Blob([fileBuffer], { type: file.type });

    // Upload to Vercel Blob
    const blob = await put(finalFilename, cleanBlob, {
      contentType: file.type,
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Upload error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
