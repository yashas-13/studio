"use client";

import { useEffect, useState } from "react";
import {
  File as FileIcon,
  ListFilter,
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
import { db, addDoc, collection, onSnapshot, doc, deleteDoc } from "@/lib/firebase";

interface File {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  role: string;
  date: string;
  size: string;
}

export function FileSharingClient() {
  const [files, setFiles] = useState<File[]>([]);
  
  useEffect(() => {
    const q = collection(db, "files");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const filesData: File[] = [];
      querySnapshot.forEach((doc) => {
        filesData.push({ id: doc.id, ...doc.data() } as File);
      });
      setFiles(filesData);
    });

    return () => unsubscribe();
  }, []);

  const handleFileUpload = async () => {
    // This is a placeholder for file upload logic.
    // In a real app, you would use Firebase Storage to upload the file
    // and then create a document in Firestore with the file metadata.
    const now = new Date();
    const newFile = {
      name: `New-Document-${now.getTime()}.pdf`,
      type: "Document",
      uploadedBy: "Site Admin",
      role: "Admin",
      date: now.toISOString().split("T")[0],
      size: `${(Math.random() * 10).toFixed(1)} MB`,
    };
    await addDoc(collection(db, "files"), newFile);
  };
  
  const handleDelete = async (fileId: string) => {
    await deleteDoc(doc(db, "files", fileId));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">File Sharing</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <ListFilter className="h-3.5 w-3.5" />
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
          <CardTitle>Project Documents</CardTitle>
          <CardDescription>
            A central repository for owners and engineers to exchange files.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead className="hidden md:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Uploaded By</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="text-right">Size</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{file.type}</Badge>
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
                      <div>
                        <p className="text-sm font-medium">{file.uploadedBy}</p>
                        <p className="text-xs text-muted-foreground">
                          {file.role}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {file.date}
                  </TableCell>
                  <TableCell className="text-right">{file.size}</TableCell>
                  <TableCell>
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
