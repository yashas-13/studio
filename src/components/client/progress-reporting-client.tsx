
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { db, collection, addDoc, onSnapshot, doc, updateDoc, getDoc, query, orderBy, serverTimestamp, where } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { type Project } from "@/app/dashboard/owner/projects/page";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";

export function ProgressReportingClient() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>("");
    const [caption, setCaption] = useState("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { toast } = useToast();

    useEffect(() => {
        const qProjects = query(collection(db, "projects"), where("status", "==", "In Progress"));
        const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Project)));
        });

        return () => unsubscribeProjects();
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProject || !photo || !caption) {
            toast({ title: "Error", description: "Please select a project, upload a photo, and add a caption.", variant: "destructive" });
            return;
        }
        setIsSubmitting(true);
        try {
            // In a real app, you would upload the photo to Firebase Storage and get a URL.
            // For this demo, we'll simulate it and use a placeholder URL.
            const filePayload = {
                name: caption,
                type: "Image",
                url: preview, // Using data URI as a placeholder
                size: `${(photo.size / 1024 / 1024).toFixed(2)} MB`,
                date: new Date().toISOString().split('T')[0],
                projectId: selectedProject,
                uploadedBy: localStorage.getItem('userName') || 'Site Manager'
            };
            await addDoc(collection(db, "files"), filePayload);

            // Also add to the activity feed
            const project = projects.find(p => p.id === selectedProject);
            await addDoc(collection(db, "activityFeed"), {
                type: 'PROGRESS_UPDATE',
                user: localStorage.getItem('userName') || 'Site Manager',
                details: `New photo uploaded for ${project?.name}: "${caption}"`,
                timestamp: serverTimestamp()
            });

            toast({ title: "Success", description: "Progress report uploaded successfully." });
            // Reset form
            setSelectedProject("");
            setCaption("");
            setPhoto(null);
            setPreview(null);
        } catch (error) {
            console.error("Error submitting report:", error);
            toast({ title: "Error", description: "Could not submit progress report.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upload Site Progress</CardTitle>
                <CardDescription>Select a project, upload a photo, and provide a caption for the update.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="project">Project</Label>
                        <Select value={selectedProject} onValueChange={setSelectedProject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an active project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="photo">Progress Photo</Label>
                        <Input id="photo" type="file" accept="image/*" onChange={handleFileChange} />
                         {preview && <Image src={preview} alt="Progress preview" width={200} height={150} className="mt-2 rounded-md object-cover" data-ai-hint="construction site progress" />}
                    </div>
                     <div className="grid gap-2">
                        <Label htmlFor="caption">Caption / Stage Tag</Label>
                        <Textarea id="caption" placeholder="e.g., 'Level 5 slab completed.' or 'Facade work, west wing.'" value={caption} onChange={(e) => setCaption(e.target.value)} />
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                        {isSubmitting ? <Loader2 className="animate-spin mr-2"/> : <Camera className="mr-2" />}
                        Submit Report
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
