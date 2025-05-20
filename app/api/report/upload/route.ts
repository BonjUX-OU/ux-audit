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
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get("filename") || "unnamed-file";

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Generate a safe unique filename with original extension
    const extension = file.name.split(".").pop();
    const safeFilename = `${filename.replace(/[^\w-]/g, "")}-${Date.now()}.${extension}`;

    const blob = await put(safeFilename, file, {
      contentType: file.type,
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
