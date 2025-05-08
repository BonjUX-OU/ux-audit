import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {

    const formData = await req.formData();
    const body = Object.fromEntries(formData);
    const file = (body.file as Blob) || null;

    let buffer = Buffer.from(await file.arrayBuffer());    
    let kk =  buffer.toString('base64');

    return NextResponse.json({ message: "Files Created" });
  } catch(error: any) {
    console.error("Error uploading images:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
