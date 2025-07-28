
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Project } from "../../page";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface ProjectFile {
    id: string;
    name: string;
    type: "Image" | "Document" | "Spreadsheet" | string;
    url: string;
    size: string;
    date: any;
    projectId: string;
}

export default function ProjectFilesPage() {
    const params = useParams();
    const { id } = params;
    const [project, setProject] = useState<Project | null>(null);
    const [files, setFiles] = useState<ProjectFile[]>([]);
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
            
            const q = query(collection(db, "files"), where("projectId", "==", id));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const filesData: ProjectFile[] = [];
                querySnapshot.forEach((doc) => {
                    filesData.push({ id: doc.id, ...doc.data() } as ProjectFile);
                });
                setFiles(filesData);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [id]);

    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    const documentFiles = files.filter(f => !f.type.startsWith('image/'));
    
    const formatDate = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, "PPP");
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">
                    Photo Gallery & Files: {project?.name || 'Project'}
                </h1>
            </div>

             <Card>
                <CardHeader>
                    <CardTitle>Photo Gallery</CardTitle>
                    <CardDescription>
                        Images uploaded for this project, such as site progress photos.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[...Array(4)].map((_, i) => <Skeleton key={i} className="aspect-square w-full" />)}
                        </div>
                    ) : imageFiles.length > 0 ? (
                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {imageFiles.map(file => (
                                <div key={file.id} className="relative aspect-square group overflow-hidden rounded-lg">
                                    <Image 
                                        src={file.url || `https://placehold.co/400x400.png`} 
                                        alt={file.name} 
                                        fill={true} 
                                        className="object-cover rounded-lg transition-transform duration-300 group-hover:scale-105" 
                                        data-ai-hint="construction site progress" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div className="absolute bottom-0 left-0 right-0 p-3">
                                        <p className="text-white text-xs font-semibold truncate">{file.name}</p>
                                        <p className="text-white/80 text-xs">{formatDate(file.date)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-center py-8">No photos found for this project.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>
                        Blueprints, permits, and other files related to this project.
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
                                <TableHead>File Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="text-right">Size</TableHead>
                                <TableHead className="text-right">Date Uploaded</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documentFiles.length > 0 ? (
                                documentFiles.map(file => (
                                    <TableRow key={file.id}>
                                        <TableCell className="font-medium">{file.name}</TableCell>
                                        <TableCell><Badge variant="secondary">{file.type}</Badge></TableCell>
                                        <TableCell className="text-right">{file.size}</TableCell>
                                        <TableCell className="text-right">{formatDate(file.date)}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">No documents found for this project.</TableCell>
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
