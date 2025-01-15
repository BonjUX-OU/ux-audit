"use client";

import { useEffect, useState, FormEvent } from "react";
import AppBar from "@/components/layout/AppBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useSession } from "next-auth/react";

// If you have a user session from next-auth, you can import and use `useSession`
// import { useSession } from "next-auth/react";

type Project = {
  _id: string;
  owner?: string; // or { _id: string, name: string } if you populated
  name: string;
  description?: string;
  createdAt?: string;
};

export default function DashboardPage() {
  // const { data: session, status } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [openDialog, setOpenDialog] = useState(false); // If your session user ID is needed, you'd set it from session
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const { data: session }: any = useSession();

  // Fetch projects from our new route
  async function fetchProjects() {
    try {
      const response = await fetch("/api/projects", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      const data = await response.json();
      setProjects(data);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchProjects();
  }, []);

  // Handle create
  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: session.user.id, name, description }),
      });
      if (!response.ok) {
        throw new Error("Error creating project");
      }
      // Clear inputs
      setName("");
      setDescription("");
      setOpenDialog(false);
      // Refetch
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppBar />
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-64 border-r p-4 bg-gray-50">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>

          <Accordion type="single" collapsible>
            {projects.map((proj) => (
              <AccordionItem key={proj._id} value={proj._id}>
                <AccordionTrigger>{proj.name}</AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm">
                    {proj.description || "No description."}
                  </p>
                  {/* 
                    Here you could display each project's "reports" or other details.
                    E.g.: 
                    <ul>
                      {proj.reports?.map(r => <li key={r._id}>{r.title}</li>)}
                    </ul>
                  */}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button variant="default" className="mt-4 w-full">
                + New Project
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new Project</DialogTitle>
                <DialogDescription>
                  Enter details for your new project.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 mt-4">
                {/* If you need the owner field or if the server sets it automatically from session */}

                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <Input
                    type="text"
                    placeholder="Project Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Input
                    type="text"
                    placeholder="Optional"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setOpenDialog(false)}
                    type="button"
                  >
                    Cancel
                  </Button>
                  <Button variant="default" type="submit">
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
          <p>
            Welcome to your Dashboard! Select a project from the sidebar to get
            started.
          </p>
        </main>
      </div>
    </div>
  );
}
