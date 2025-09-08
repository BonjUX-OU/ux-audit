// app/api/projects/route.ts
import dbConnect from "@/lib/dbConnect";
import Project from "@/models/Project";
import { NextResponse } from "next/server";
import Report from "@/models/Report";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/configs/auth/authOptions";
import mongoose from "mongoose";

/**
 * GET /api/apps - Get all apps
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await dbConnect();

    const userId = new mongoose.Types.ObjectId(session.user?._id);

    const apps = await Project.find({ createdBy: userId }).populate("createdBy").sort({ createdAt: -1 });

    return NextResponse.json(apps, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error fetching apps:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}

/**
 * POST /api/apps - Create a new app
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    await dbConnect();
    const { name, description } = await request.json();

    const objId = new mongoose.Types.ObjectId(session.user?._id);

    const app = new Project({
      createdBy: objId,
      name,
      description,
    });

    await app.save();

    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error creating app:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}

/**
 * PUT /api/apps/:id - Update an app by ID
 */
export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "App ID is required" }, { status: 400 });
  }

  try {
    await dbConnect();
    const data = await request.json();
    const updatedApp = await Project.findByIdAndUpdate(id, data, { new: true });

    if (!updatedApp) {
      return NextResponse.json({ error: "App not found" }, { status: 404 });
    }

    return NextResponse.json(updatedApp, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating app:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}

/**
 * DELETE /api/projects?id=XYZ - Delete a project by ID,
 * including all associated reports.
 */
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Project ID is required" }, { status: 400 });
  }

  try {
    await dbConnect();

    // First find and delete the project
    const deletedProject = await Project.findByIdAndDelete(id);
    if (!deletedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Delete all reports associated with this project
    await Report.deleteMany({ project: id });

    return NextResponse.json({ message: "Project and associated reports deleted successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error deleting project:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.log(error);
      return NextResponse.json({ error }, { status: 500 });
    }
  }
}
