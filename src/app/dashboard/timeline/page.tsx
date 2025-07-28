
"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GanttChartSquare, Milestone, Package } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Project } from "../owner/projects/page";

interface Task {
    id: string;
    name: string;
    status: 'To-Do' | 'In Progress' | 'Done';
    dueDate: string;
    assignee: string;
    projectId: string;
}

const getDaysDifference = (start: Date, end: Date) => {
  return (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
};

export default function TimelinePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  useEffect(() => {
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Project)));
    });
    const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Task)));
    });
    return () => {
      unsubProjects();
      unsubTasks();
    }
  }, []);

  // For demonstration, we'll create a timeline for the first "In Progress" project
  const project = projects.find(p => p.status === 'In Progress');

  if (!project) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Project Timeline</h1>
        </div>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No "In Progress" projects to display a timeline for.
          </CardContent>
        </Card>
      </div>
    );
  }

  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const startDate = project.createdAt ? project.createdAt.toDate() : new Date();
  // Simplified end date logic
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 3, startDate.getDate());

  const totalDays = getDaysDifference(startDate, endDate);

  const calculatePosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const daysFromStart = getDaysDifference(startDate, date);
    return (daysFromStart / totalDays) * 100;
  };
  
  const months = [];
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    months.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Project Timeline</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline">Export Timeline</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription>
            {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative">
            {/* Months */}
            <div className="relative flex h-8 items-center border-b">
              {months.map((month, index) => (
                <div
                  key={index}
                  className="text-sm font-semibold text-muted-foreground"
                  style={{
                    position: 'absolute',
                    left: `${calculatePosition(month.toISOString().split('T')[0])}%`
                  }}
                >
                  {month.toLocaleString('default', { month: 'long' })}
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            {/* Milestones / Tasks */}
            <div className="relative h-20 w-full">
              {projectTasks.map(task => (
                 <div
                    key={task.id}
                    className="absolute top-0 -translate-x-1/2"
                    style={{ left: `${calculatePosition(task.dueDate)}%` }}
                    title={`${task.name}: ${task.dueDate}`}
                  >
                   <Milestone className="h-5 w-5 text-accent" />
                   <p className="text-xs whitespace-nowrap mt-1">{task.name}</p>
                 </div>
              ))}
               {projectTasks.length === 0 && <p className="text-center text-sm text-muted-foreground">No tasks (milestones) for this project yet.</p>}
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
