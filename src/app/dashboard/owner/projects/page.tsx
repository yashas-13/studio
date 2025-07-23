
'use client'

import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectBoard } from "@/components/project-board";
import { useEffect, useState } from "react";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { db, collection, onSnapshot, query, orderBy } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export interface Project {
  id: string;
  name: string;
  description: string;
  location: string;
  siteEngineer: string;
  status: 'Planning' | 'In Progress' | 'Completed';
  createdAt: any;
  budget: number;
  spent: number;
  progress: number;
}

export default function ProjectsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData: Project[] = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      toast({
        title: "Error",
        description: "Could not fetch projects.",
        variant: "destructive"
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [toast]);


  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Project Management</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1" onClick={() => setIsDialogOpen(true)}>
                <PlusCircle className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Create Project
                </span>
            </Button>
        </div>
      </div>
      <ProjectBoard projects={projects} loading={loading} />
      <CreateProjectDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} />
    </div>
  );
}

    