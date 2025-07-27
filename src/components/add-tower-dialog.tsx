
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
import { db, collection, addDoc } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface AddTowerDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    projectId: string;
}

export function AddTowerDialog({ isOpen, onOpenChange, projectId }: AddTowerDialogProps) {
    const [name, setName] = useState("");
    const [floors, setFloors] = useState("");
    const [unitsPerFloor, setUnitsPerFloor] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const resetForm = () => {
        setName("");
        setFloors("");
        setUnitsPerFloor("");
    }

    const handleSubmit = async () => {
        if (!name || !floors || !unitsPerFloor) {
            toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            await addDoc(collection(db, "towers"), {
                name,
                floors: parseInt(floors),
                unitsPerFloor: parseInt(unitsPerFloor),
                projectId: projectId
            });

            toast({ title: "Success", description: "Tower added successfully." });
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error("Error creating tower:", error);
            toast({ title: "Error", description: "Could not add tower.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) resetForm(); }}>
            <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
                <DialogTitle>Add New Tower</DialogTitle>
                <DialogDescription>
                    Fill in the details for the new tower in your project.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Tower Name</Label>
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" placeholder="e.g., Tower A" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="floors" className="text-right">Floors</Label>
                    <Input id="floors" type="number" value={floors} onChange={(e) => setFloors(e.target.value)} className="col-span-3" placeholder="e.g., 25" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unitsPerFloor" className="text-right">Units / Floor</Label>
                    <Input id="unitsPerFloor" type="number" value={unitsPerFloor} onChange={(e) => setUnitsPerFloor(e.target.value)} className="col-span-3" placeholder="e.g., 4" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Adding..." : "Add Tower"}
                </Button>
            </DialogFooter>
            </DialogContent>
      </Dialog>
    )
}
