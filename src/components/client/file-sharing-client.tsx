
"use client";

import { useEffect, useState } from "react";
import {
  File as FileIcon,
  Filter,
  MoreHorizontal,
  Upload,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db, addDoc, collection, onSnapshot, doc, deleteDoc, query, orderBy } from "@/lib/firebase";
import { format } from "date-fns";
import Link from "next/link";
import { Skeleton } from "../ui/skeleton";

interface File {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  role: string;
  date: any;
  size: string;
  projectId?: string;
  leadId?: string;
  leadName?: string;
}

export function FileSharingClient() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const q = query(collection(db, "files"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const filesData: File[] = [];
      querySnapshot.forEach((doc) => {
        filesData.push({ id: doc.id, ...doc.data() } as File);
      });
      setFiles(filesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async () => {
    // This is a placeholder for file upload logic.
    const now = new Date();
    const newFile = {
      name: `Shared-File-${now.getTime()}.pdf`,
      type: "application/pdf",
      uploadedBy: "Admin",
      role: "Owner",
      date: now.toISOString(),
      size: `${(Math.random() * 5).toFixed(1)} MB`,
    };
    await addDoc(collection(db, "files"), newFile);
  };
  
  const handleDelete = async (fileId: string) => {
    await deleteDoc(doc(db, "files", fileId));
  }
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return format(date, "PPP");
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Global File Repository</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <Filter className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Filter
            </span>
          </Button>
          <Button size="sm" className="h-8 gap-1" onClick={handleFileUpload}>
            <Upload className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Upload File
            </span>
          </Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Uploaded Files</CardTitle>
          <CardDescription>
            A central repository for all files uploaded across projects and leads.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Associated With</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_,i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}><Skeleton className="h-5 w-full"/></TableCell>
                  </TableRow>
                ))
              ) : files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge variant="outline">{file.type}</Badge>
                  </TableCell>
                   <TableCell className="hidden md:table-cell">
                    {file.projectId ? (
                      <Link href={`/dashboard/owner/projects/${file.projectId}/files`} className="hover:underline">
                        Project Document
                      </Link>
                    ) : file.leadId ? (
                      <Link href={`/dashboard/crm/${file.leadId}`} className="hover:underline">
                        Lead: {file.leadName}
                      </Link>
                    ) : (
                      'General Upload'
                    )}
                   </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage
                          src={`https://i.pravatar.cc/40?u=${file.uploadedBy}`}
                          alt="Avatar"
                        />
                        <AvatarFallback>
                          {file.uploadedBy.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs">{file.uploadedBy}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {formatDate(file.date)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>Download</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(file.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{files.length}</strong> of <strong>{files.length}</strong> files
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
