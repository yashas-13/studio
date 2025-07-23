
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, collection, addDoc, serverTimestamp, onSnapshot } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface CreateProjectDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

interface SiteManager {
    id: string;
    name: string;
}

export function CreateProjectDialog({ isOpen, onOpenChange }: CreateProjectDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [siteEngineer, setSiteEngineer] = useState("");
    const [budget, setBudget] = useState("");
    const [siteManagers, setSiteManagers] = useState<SiteManager[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        const q = collection(db, "users");
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const managers: SiteManager[] = [];
            querySnapshot.forEach((doc) => {
                if(doc.data().role === 'sitemanager') {
                    managers.push({ id: doc.id, name: doc.data().name });
                }
            });
            setSiteManagers(managers);
        });

        return () => unsubscribe();
    }, []);

    const handleSubmit = async () => {
        if (!name || !description || !siteEngineer || !location || !budget) {
            toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            await addDoc(collection(db, "projects"), {
                name,
                description,
                location,
                siteEngineer,
                budget: parseFloat(budget),
                spent: 0,
                progress: 0,
                status: "Planning",
                createdAt: serverTimestamp(),
            });
            toast({ title: "Success", description: "Project created successfully." });
            onOpenChange(false);
            // Reset form
            setName("");
            setDescription("");
            setLocation("");
            setSiteEngineer("");
            setBudget("");
        } catch (error) {
            console.error("Error creating project:", error);
            toast({ title: "Error", description: "Could not create project.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                Fill in the details to create a new project.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., Downtown Tower Renovation" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="location" className="text-right">Location</Label>
                    <Input id="location" value={location} onChange={(e) => setLocation(e.target.value)} className="col-span-3" placeholder="e.g., New York, NY" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="description" className="text-right">Description</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" placeholder="Briefly describe the project scope." />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="budget" className="text-right">Budget (₹)</Label>
                    <Input id="budget" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="col-span-3" placeholder="e.g., 5000000" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="site-engineer" className="text-right">Site Manager</Label>
                    <Select value={siteEngineer} onValueChange={setSiteEngineer}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a manager" />
                        </SelectTrigger>
                        <SelectContent>
                            {siteManagers.map(manager => (
                                <SelectItem key={manager.id} value={manager.name}>{manager.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Creating..." : "Create Project"}
                </Button>
            </DialogFooter>
            </DialogContent>
      </Dialog>
    )
}

    