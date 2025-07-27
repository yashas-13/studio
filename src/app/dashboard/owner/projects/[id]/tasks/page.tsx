
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Project } from "../../page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface Task {
    id: string;
    name: string;
    status: 'To-Do' | 'In Progress' | 'Done';
    dueDate: string;
    assignee: string;
}

export default function ProjectTasksPage() {
    const params = useParams();
    const { id } = params;
    const [project, setProject] = useState<Project | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof id === 'string') {
            const fetchProject = async () => {
                const docRef = doc(db, 'projects', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProject({ id: docSnap.id, ...docSnap.data() } as Project);
                }
            }
            fetchProject();
            
            const q = query(collection(db, "tasks"), where("projectId", "==", id));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const tasksData: Task[] = [];
                querySnapshot.forEach((doc) => {
                    tasksData.push({ id: doc.id, ...doc.data() } as Task);
                });
                setTasks(tasksData);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [id]);
    
    const getStatusVariant = (status: string): "secondary" | "outline" | "default" => {
        switch(status) {
            case 'Done': return 'secondary';
            case 'In Progress': return 'default';
            case 'To-Do': 
            default:
                return 'outline';
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">
                    Task List: {project?.name || 'Project'}
                </h1>
                <div className="ml-auto">
                    <Button disabled>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Task
                    </Button>
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Project Tasks</CardTitle>
                    <CardDescription>
                        All tasks related to this project. This feature is currently in development.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                         </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Task</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Assignee</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.length > 0 ? (
                                    tasks.map(task => (
                                        <TableRow key={task.id}>
                                            <TableCell className="font-medium">{task.name}</TableCell>
                                            <TableCell><Badge variant={getStatusVariant(task.status)}>{task.status}</Badge></TableCell>
                                            <TableCell>{task.dueDate}</TableCell>
                                            <TableCell>{task.assignee}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center">No tasks found for this project.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
