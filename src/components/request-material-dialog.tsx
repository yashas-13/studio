
"use client";

import { useState } from "react";
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
import { db, collection, addDoc, serverTimestamp } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { type Project } from "@/app/dashboard/owner/projects/page";

interface RequestMaterialDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    projects: Project[];
}

export function RequestMaterialDialog({ isOpen, onOpenChange, projects }: RequestMaterialDialogProps) {
    const [projectId, setProjectId] = useState("");
    const [materialName, setMaterialName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const resetForm = () => {
        setProjectId("");
        setMaterialName("");
        setQuantity("");
        setUnit("");
        setNotes("");
    }
    
    const handleClose = () => {
        onOpenChange(false);
        resetForm();
    }

    const handleSubmit = async () => {
        if (!projectId || !materialName || !quantity || !unit) {
            toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const project = projects.find(p => p.id === projectId);
            if (!project) {
                toast({ title: "Error", description: "Selected project not found.", variant: "destructive" });
                setLoading(false);
                return;
            }

            const requestPayload = {
                name: materialName,
                project: project.name,
                quantity: parseFloat(quantity),
                unit,
                status: 'Pending',
                supplier: 'Internal Request',
                lastUpdated: new Date().toISOString(),
            };
            await addDoc(collection(db, "materials"), requestPayload);

            // Create activity feed item
            const activityDetail = `Material request: ${quantity} ${unit} of ${materialName} for project ${project.name}.`;
             await addDoc(collection(db, "activityFeed"), {
                type: 'MATERIAL_REQUEST',
                user: localStorage.getItem('userName') || 'Site Manager',
                details: activityDetail,
                timestamp: serverTimestamp()
            });

            toast({ title: "Success", description: "Material request submitted." });
            handleClose();
        } catch (error) {
            console.error("Error creating material request:", error);
            toast({ title: "Error", description: "Could not submit request.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Request New Material</DialogTitle>
                <DialogDescription>
                Submit an internal request for materials needed on site. This will notify the owner.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project" className="text-right">Project</Label>
                    <Select value={projectId} onValueChange={setProjectId}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="materialName" className="text-right">Material Name</Label>
                    <Input id="materialName" value={materialName} onChange={(e) => setMaterialName(e.target.value)} className="col-span-3" placeholder="e.g., Cement Bags" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">Quantity</Label>
                    <Input id="quantity" type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="col-span-3" placeholder="e.g., 500" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">Unit</Label>
                    <Input id="unit" value={unit} onChange={(e) => setUnit(e.target.value)} className="col-span-3" placeholder="e.g., bags, tons, m³" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="notes" className="text-right">Notes</Label>
                    <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="col-span-3" placeholder="Reason for request, urgency, etc." />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Submitting..." : "Submit Request"}
                </Button>
            </DialogFooter>
            </DialogContent>
      </Dialog>
    )
}
