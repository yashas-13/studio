
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db, collection, addDoc, query, where, onSnapshot } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { type Project } from "@/app/dashboard/owner/projects/page";
import { type Tower } from "@/app/dashboard/owner/projects/[id]/towers/page";

interface AddPropertyDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    projects: Project[];
}

export function AddPropertyDialog({ isOpen, onOpenChange, projects }: AddPropertyDialogProps) {
    const [unitNumber, setUnitNumber] = useState("");
    const [projectId, setProjectId] = useState("");
    const [towerId, setTowerId] = useState("");
    const [type, setType] = useState("");
    const [size, setSize] = useState("");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState("Available");
    const [photo, setPhoto] = useState<File | null>(null);
    const [towers, setTowers] = useState<Tower[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    
    useEffect(() => {
        if (projectId) {
            const q = query(collection(db, "towers"), where("projectId", "==", projectId));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const towersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tower));
                setTowers(towersData);
            });
            return () => unsubscribe();
        } else {
            setTowers([]);
        }
    }, [projectId]);

    const resetForm = () => {
        setUnitNumber("");
        setProjectId("");
        setTowerId("");
        setType("");
        setSize("");
        setPrice("");
        setStatus("Available");
        setPhoto(null);
        setTowers([]);
    }
    
    const handleProjectChange = (id: string) => {
        setProjectId(id);
        setTowerId("");
    }

    const handleSubmit = async () => {
        if (!unitNumber || !projectId || !type || !size || !price || !status) {
            toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const selectedProject = projects.find(p => p.id === projectId);
            const selectedTower = towers.find(t => t.id === towerId);
            
            // In a real app, you'd upload the photo to Firebase Storage and get the URL
            const newProperty: any = {
                unitNumber,
                project: selectedProject?.name,
                tower: selectedTower?.name,
                type,
                size: parseFloat(size),
                price: parseFloat(price),
                status,
                photoUrl: null
            };

            if (photo) {
                // Placeholder for upload logic
                console.log("Photo selected, but upload logic is not implemented.");
            }

            await addDoc(collection(db, "properties"), newProperty);

            toast({ title: "Success", description: "Property added successfully." });
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error("Error creating property:", error);
            toast({ title: "Error", description: "Could not add property.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { onOpenChange(open); if (!open) resetForm(); }}>
            <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
                <DialogTitle>Add New Property</DialogTitle>
                <DialogDescription>
                Fill in the details for the new property listing.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="project" className="text-right">Project</Label>
                    <Select value={projectId} onValueChange={handleProjectChange}>
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
                    <Label htmlFor="tower" className="text-right">Tower</Label>
                    <Select value={towerId} onValueChange={setTowerId} disabled={!projectId}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a tower" />
                        </SelectTrigger>
                        <SelectContent>
                            {towers.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unitNumber" className="text-right">Unit No.</Label>
                    <Input id="unitNumber" value={unitNumber} onChange={(e) => setUnitNumber(e.target.value)} className="col-span-3" placeholder="e.g., A-101" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">Type</Label>
                    <Input id="type" value={type} onChange={(e) => setType(e.target.value)} className="col-span-3" placeholder="e.g., 2BHK, 3BHK, Office" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="size" className="text-right">Size (sqft)</Label>
                    <Input id="size" type="number" value={size} onChange={(e) => setSize(e.target.value)} className="col-span-3" placeholder="e.g., 1200" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price" className="text-right">Price (₹)</Label>
                    <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="col-span-3" placeholder="e.g., 7500000" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select value={status} onValueChange={(value: "Available" | "Booked" | "Sold") => setStatus(value)}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Available">Available</SelectItem>
                            <SelectItem value="Booked">Booked</SelectItem>
                            <SelectItem value="Sold">Sold</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="photo" className="text-right">Photo</Label>
                    <Input id="photo" type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={loading}>
                    {loading ? "Adding..." : "Add Property"}
                </Button>
            </DialogFooter>
            </DialogContent>
      </Dialog>
    )
}
