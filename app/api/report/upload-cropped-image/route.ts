// app/api/report/upload/route.ts
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  const blob = await put(filename!, request.body!, {
    access: "public",
    allowOverwrite: true,
  });

  return NextResponse.json(blob);
}

export async function PUT(request: Request) {
  const form = await request.formData();
  const file = form.get("file") as File;
  const blob = await put(file.name, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return Response.json(blob);
}

// For App Router (Next.js 13+)
// export async function POST(request) {
//   try {
//     const contentType = request.headers.get('content-type');
//     const filename = request.headers.get('x-filename');

//     if (!contentType || !filename) {
//       return NextResponse.json(
//         { success: false, error: 'Missing content-type or filename' },
//         { status: 400 }
//       );
//     }

//     // Get the file blob from the request
//     const blob = await request.blob();

//     // Generate a unique folder path (optional, for organization)
//     const userId = 'user_12345'; // Replace with actual user ID from your auth system
//     const folder = `screenshots/${userId}`;
//     const uniqueFilename = `${folder}/${Date.now()}-${filename}`;

//     // Upload to Vercel Blob with cacheControl settings
//     const { url } = await put(uniqueFilename, blob, {
//       contentType,
//       access: 'public', // Make it publicly accessible
//       cacheControl: 'public, max-age=31536000', // Cache for 1 year
//       multipart: false // Set to true for larger files
//     });

//     return NextResponse.json({ success: true, url });
//   } catch (error) {
//     console.error('Error uploading to Vercel Blob:', error);
//     return NextResponse.json(
//       { success: false, error: error.message || 'Failed to upload' },
//       { status: 500 }
//     );
//   }
// }
