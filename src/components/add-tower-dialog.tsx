
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
import { db, collection, addDoc, updateDoc, doc, getDoc } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { type Tower } from "@/app/dashboard/owner/projects/[id]/towers/page";
import { type Project } from "@/app/dashboard/owner/projects/page";

interface AddTowerDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    projectId: string;
    towerToEdit?: Tower | null;
}

export function AddTowerDialog({ isOpen, onOpenChange, projectId, towerToEdit }: AddTowerDialogProps) {
    const [name, setName] = useState("");
    const [floors, setFloors] = useState("");
    const [unitsPerFloor, setUnitsPerFloor] = useState("");
    const [defaultPrice, setDefaultPrice] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (towerToEdit) {
            setName(towerToEdit.name);
            setFloors(String(towerToEdit.floors));
            setUnitsPerFloor(String(towerToEdit.unitsPerFloor));
            setDefaultPrice(""); // Price is not stored on tower, so it's only for creation
        } else {
            resetForm();
        }
    }, [towerToEdit, isOpen]);

    const resetForm = () => {
        setName("");
        setFloors("");
        setUnitsPerFloor("");
        setDefaultPrice("");
    }

    const handleSubmit = async () => {
        if (!name || !floors || !unitsPerFloor) {
            toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
            return;
        }
         if (!towerToEdit && !defaultPrice) {
            toast({ title: "Error", description: "Please provide a default unit price for new towers.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const floorsNum = parseInt(floors);
            const unitsPerFloorNum = parseInt(unitsPerFloor);

            const towerData = {
                name,
                floors: floorsNum,
                unitsPerFloor: unitsPerFloorNum,
                projectId: projectId
            };
            
            if (towerToEdit) {
                // Update existing tower
                const towerRef = doc(db, "towers", towerToEdit.id);
                await updateDoc(towerRef, towerData);
                toast({ title: "Success", description: "Tower updated successfully." });
                 // Note: Logic for adjusting units on edit (e.g., adding/removing floors) is complex and not implemented here.
            } else {
                // Add new tower
                const towerRef = await addDoc(collection(db, "towers"), towerData);
                toast({ title: "Success", description: "Tower added successfully. Auto-generating units..." });

                // Auto-generate units for the new tower
                const projectRef = doc(db, 'projects', projectId);
                const projectSnap = await getDoc(projectRef);
                if (!projectSnap.exists()) {
                    throw new Error("Project not found");
                }
                const project = projectSnap.data() as Project;

                for (let f = 1; f <= floorsNum; f++) {
                    for (let u = 1; u <= unitsPerFloorNum; u++) {
                        const unitNumber = `${name.charAt(0)}-${f}${u.toString().padStart(2, '0')}`;
                        const newProperty = {
                            unitNumber: unitNumber,
                            project: project.name,
                            projectId: projectId,
                            tower: name,
                            towerId: towerRef.id,
                            floor: f,
                            type: '2BHK', // Default value
                            size: 1200,    // Default value
                            price: parseFloat(defaultPrice),
                            status: 'Available',
                            photoUrl: null,
                            bookedByLeadId: null,
                            bookedByLeadName: null,
                        };
                        await addDoc(collection(db, 'properties'), newProperty);
                    }
                }
                 toast({ title: "Units Generated", description: `Created ${floorsNum * unitsPerFloorNum} units for ${name}.` });
            }

            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error("Error saving tower:", error);
            toast({ title: "Error", description: "Could not save tower.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };
    
    const handleClose = () => {
        onOpenChange(false);
        resetForm();
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
                <DialogTitle>{towerToEdit ? "Edit Tower" : "Add New Tower"}</DialogTitle>

                <DialogDescription>
                    {towerToEdit ? "Update the details for this tower. Note: Changing floor/unit counts will not automatically adjust existing properties." : "Fill in the details for the new tower. This will also auto-generate the associated property units."}
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
                 {!towerToEdit && (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="defaultPrice" className="text-right">Default Unit Price (₹)</Label>
                        <Input id="defaultPrice" type="number" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} className="col-span-3" placeholder="e.g., 7500000" />
                    </div>
                )}
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                </Button>
            </DialogFooter>
            </DialogContent>
      </Dialog>
    )
}
