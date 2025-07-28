
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addLeadDocument } from '@/app/dashboard/crm/actions';
import { File, FilePlus, FileText, Image } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from './ui/input';
import { type Lead } from '@/app/dashboard/crm/page';


interface Document {
    id: string;
    name: string;
    type: string;
    url: string;
    date: any;
}

interface LeadDocumentsCardProps {
    lead: Lead;
}

export default function LeadDocumentsCard({ lead }: LeadDocumentsCardProps) {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        if (!lead.id) return;
        // Query the central 'files' collection for documents linked to this lead
        const documentsQuery = query(collection(db, 'files'), where('leadId', '==', lead.id));
        const unsub = onSnapshot(documentsQuery, (snapshot) => {
            const docsData: Document[] = [];
            snapshot.forEach(doc => {
                docsData.push({ id: doc.id, ...doc.data() } as Document);
            });
            // Sort client-side
            docsData.sort((a, b) => b.date?.toDate() - a.date?.toDate());
            setDocuments(docsData);
        });
        return () => unsub();
    }, [lead.id]);

    const handleUpload = async () => {
        if (!selectedFile) {
            toast({ title: "No file selected", description: "Please choose a file to upload.", variant: "destructive" });
            return;
        }
        try {
            const fileSize = `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`;
            await addLeadDocument(lead.id, lead.name, selectedFile.name, selectedFile.type, fileSize);
            toast({ title: "Document Uploaded", description: `${selectedFile.name} has been added.` });
            setIsUploading(false);
            setSelectedFile(null);
        } catch (error) {
            console.error("Error uploading document: ", error);
            toast({ title: "Error", description: "Could not upload document.", variant: "destructive" });
        }
    };
    
    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="h-5 w-5" />;
        if (type === 'application/pdf') return <FileText className="h-5 w-5" />;
        return <File className="h-5 w-5" />;
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className='flex justify-between items-start'>
                        <div>
                            <CardTitle>Customer Documents</CardTitle>
                            <CardDescription>KYC, agreements, etc.</CardDescription>
                        </div>
                         <Button variant="ghost" size="icon" onClick={() => setIsUploading(true)}>
                            <FilePlus className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {documents.length > 0 ? documents.map(doc => (
                            <div key={doc.id} className="flex items-center gap-3 p-2 rounded-md border">
                                <div className="text-muted-foreground">{getFileIcon(doc.type)}</div>
                                <div className="flex-1 text-sm truncate">{doc.name}</div>
                                <Button variant="ghost" size="sm" asChild>
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">View</a>
                                </Button>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center">No documents uploaded yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Dialog open={isUploading} onOpenChange={setIsUploading}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                        <DialogDescription>
                            Select a file to upload for this lead. This is a simulation and does not actually upload the file.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Input type="file" onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)} />
                        {selectedFile && <p className="text-sm text-muted-foreground mt-2">Selected: {selectedFile.name}</p>}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                             <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleUpload} disabled={!selectedFile}>Upload</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
