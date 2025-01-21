// app/api//route.ts
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";

export const revalidate = 0;
export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const projects = await Project.find({ owner: userId }).sort({
      createdAt: -1,
    });
    return NextResponse.json(projects, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching :", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
