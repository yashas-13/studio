
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Project } from "../../page";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface UsageLog {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  project: string;
  area: string;
  date: string;
  user: string;
  notes?: string;
}

export default function ProjectUsagePage() {
    const params = useParams();
    const { id } = params;
    const [project, setProject] = useState<Project | null>(null);
    const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (typeof id === 'string') {
            const fetchProject = async () => {
                const docRef = doc(db, 'projects', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProject({ id: docSnap.id, ...docSnap.data() } as Project);
                    
                    // Fetch usage logs once project is loaded
                    const q = query(collection(db, "usageLogs"), where("project", "==", (docSnap.data() as Project).name));
                    const unsubscribe = onSnapshot(q, (querySnapshot) => {
                        const logsData: UsageLog[] = [];
                        querySnapshot.forEach((doc) => {
                            logsData.push({ id: doc.id, ...doc.data() } as UsageLog);
                        });
                        setUsageLogs(logsData);
                        setLoading(false);
                    });
                    return () => unsubscribe();
                } else {
                    setLoading(false);
                }
            }
            fetchProject();
        }
    }, [id]);
    
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">
                    Material Usage: {project?.name || 'Project'}
                </h1>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Material Consumption</CardTitle>
                    <CardDescription>
                        A detailed breakdown of all materials consumed for this specific project.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                   {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Material</TableHead>
                                    <TableHead>Quantity Used</TableHead>
                                    <TableHead>Project Area</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Logged By</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {usageLogs.length > 0 ? (
                                    usageLogs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">{log.materialName}</TableCell>
                                            <TableCell>{`${log.quantity} ${log.unit}`}</TableCell>
                                            <TableCell>{log.area}</TableCell>
                                            <TableCell>{new Date(log.date).toLocaleDateString()}</TableCell>
                                            <TableCell>{log.user}</TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">No material usage logged for this project yet.</TableCell>
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
