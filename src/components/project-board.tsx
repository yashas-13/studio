
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Project } from "@/app/dashboard/owner/projects/page";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

interface ProjectBoardProps {
  projects: Project[];
  loading: boolean;
}

const columns: Project['status'][] = ["Planning", "In Progress", "Completed"];

export function ProjectBoard({ projects, loading }: ProjectBoardProps) {

  const renderProjectCard = (project: Project) => (
    <Card key={project.id} className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{project.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{project.description}</p>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                 <Avatar className="h-6 w-6">
                    <AvatarImage src={`https://i.pravatar.cc/40?u=${project.siteEngineer}`} />
                    <AvatarFallback>{project.siteEngineer.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="text-xs">{project.siteEngineer}</span>
            </div>
            <Badge variant="secondary">{project.status}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
             <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex items-center justify-between pt-2">
                       <Skeleton className="h-6 w-20" />
                       <Skeleton className="h-6 w-16" />
                    </div>
                </CardContent>
             </Card>
        ))}
    </div>
  )

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {columns.map(status => (
            <div key={status} className="bg-muted/50 rounded-lg p-4 h-full">
                <h3 className="text-lg font-semibold mb-4 text-center">{status}</h3>
                <div className="space-y-4">
                    {loading 
                        ? renderSkeleton()
                        : projects.filter(p => p.status === status).length > 0
                            ? projects.filter(p => p.status === status).map(renderProjectCard)
                            : <p className="text-sm text-muted-foreground text-center pt-4">No projects in this stage.</p>
                    }
                </div>
            </div>
        ))}
    </div>
  );
}
