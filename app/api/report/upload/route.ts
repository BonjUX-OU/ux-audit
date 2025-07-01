// app/api/report/upload/route.ts
// import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/configs/auth/authOptions";


// export async function PUT(request: Request) {
//   const form = await request.formData();
//   const file = form.get("file") as File;
//   const blob = await put(file.name, file, {
//     access: "public",
//     addRandomSuffix: true,
//     allowOverwrite: true,
//   });

//   return Response.json(blob);
// }

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;
 
  try {
    const session = await getServerSession(authOptions);

    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (
        pathname: string,
        /* clientPayload?: string, */
      ) => {
        // Generate a client token for the browser to upload the file
 
        // ⚠️ Authenticate users before generating the token.
        // Otherwise, you're allowing anonymous uploads.
        // const { user } = await auth(request);
        // const userCanUpload = canUpload(user, pathname);
        // if (!userCanUpload) {
        //   throw new Error('Not authorized');
        // }
 
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif'],
          tokenPayload: JSON.stringify({
            // optional, sent to your server on upload completion
            userId: session?.user?._id,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Get notified of client upload completion
        // ⚠️ This will not work on `localhost` websites,
        // Use ngrok or similar to get the full upload flow
 
        console.log('blob upload completed', blob, tokenPayload);
 
        try {
          // Run any logic after the file upload completed
          // const { userId } = JSON.parse(tokenPayload);
          // await db.update({ avatar: blob.url, userId });
        } catch (error) {
          throw new Error('Could not update user');
        }
      },
    });
 
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }, // The webhook will retry 5 times waiting for a 200
    );
  }
}

// export async function POST(request: Request) {
//   try {
//     // Sanitize the URL and parameters
//     const url = new URL(request.url);
//     const rawFilename = url.searchParams.get("filename") || "unnamed-file";

//     // Thorough sanitization - remove ALL non-ASCII characters and then restrict to safe chars
//     const sanitizedFilename = rawFilename
//       .replace(/[^\x00-\x7F]/g, "") // Remove non-ASCII chars
//       .replace(/[^\w-]/g, ""); // Keep only alphanumeric, underscore and hyphen

//     console.log("Processing upload for:", sanitizedFilename);

//     // Process form data
//     const formData = await request.formData();
//     const file = formData.get("file") as File;

//     if (!file) {
//       return NextResponse.json({ error: "No file provided" }, { status: 400 });
//     }

//     // Extract file content as array buffer to ensure clean bytes
//     const fileBuffer = await file.arrayBuffer();

//     // Get clean extension (ASCII only)
//     const filenameParts = file.name.split(".");
//     const extension = filenameParts.length > 1 ? filenameParts.pop()?.replace(/[^\x00-\x7F]/g, "") : "bin";

//     // Create final safe filename
//     const finalFilename = `${sanitizedFilename}-${Date.now()}.${extension}`;
//     console.log("Final filename:", finalFilename);

//     // Create a clean Blob for upload
//     const cleanBlob = new Blob([fileBuffer], { type: file.type });

//     // Upload to Vercel Blob
//     const blob = await put(finalFilename, cleanBlob, {
//       contentType: file.type,
//       access: "public",
//     });

//     return NextResponse.json(blob);
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error("Upload error:", error);
//       console.error("Error stack:", error.stack);
//       return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
//     } else {
//       console.log(error);
//       return NextResponse.json({ error }, { status: 500 });
//     }
//   }
// }
