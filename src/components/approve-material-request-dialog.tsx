
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
import { db, doc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  name: string;
  supplier: string;
  project: string;
  quantity: number;
  unit: string;
  status: 'Delivered' | 'Pending' | 'Delayed';
  lastUpdated: string;
}

interface ApproveMaterialRequestDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    material: Material;
}

export function ApproveMaterialRequestDialog({ isOpen, onOpenChange, material }: ApproveMaterialRequestDialogProps) {
    const [supplier, setSupplier] = useState(material.supplier === 'Internal Request' ? '' : material.supplier);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleClose = () => {
        onOpenChange(false);
    }
    
    const handleApprove = async () => {
        if (!supplier) {
            toast({ title: "Supplier needed", description: "Please enter a supplier name to approve.", variant: "destructive"});
            return;
        }
        setLoading(true);
        try {
            const materialRef = doc(db, "materials", material.id);
            await updateDoc(materialRef, {
                status: "Delivered",
                supplier: supplier,
                lastUpdated: new Date().toISOString()
            });

            const activityDetail = `Material request for ${material.quantity} ${material.unit} of ${material.name} approved for project ${material.project}.`;
            await addDoc(collection(db, "activityFeed"), {
                type: 'MATERIAL_APPROVAL',
                user: 'Owner',
                details: activityDetail,
                timestamp: serverTimestamp()
            });

            toast({ title: "Request Approved", description: `Order for ${material.name} has been placed.`});
            handleClose();
        } catch (error) {
            console.error("Error approving request: ", error);
            toast({ title: "Error", description: "Could not approve the request.", variant: "destructive"});
        } finally {
            setLoading(false);
        }
    }
    
    const handleReject = async () => {
        if (!window.confirm("Are you sure you want to reject and delete this request?")) return;

        setLoading(true);
        try {
            await deleteDoc(doc(db, "materials", material.id));

            const activityDetail = `Material request for ${material.quantity} ${material.unit} of ${material.name} for project ${material.project} was rejected.`;
            await addDoc(collection(db, "activityFeed"), {
                type: 'MATERIAL_REJECTION',
                user: 'Owner',
                details: activityDetail,
                timestamp: serverTimestamp()
            });

            toast({ title: "Request Rejected", description: "The material request has been deleted."});
            handleClose();
        } catch (error) {
            console.error("Error rejecting request: ", error);
            toast({ title: "Error", description: "Could not reject the request.", variant: "destructive"});
        } finally {
            setLoading(false);
        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>Review Material Request</DialogTitle>
                <DialogDescription>
                    Approve or reject this material request from the site manager.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <p><span className="font-semibold">Material:</span> {material.name}</p>
                <p><span className="font-semibold">Quantity:</span> {material.quantity} {material.unit}</p>
                <p><span className="font-semibold">Project:</span> {material.project}</p>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="supplier" className="text-right">Supplier</Label>
                    <Input id="supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} className="col-span-3" placeholder="Enter supplier name" />
                </div>
            </div>
            <DialogFooter className="justify-between">
                <Button onClick={handleReject} variant="destructive" disabled={loading}>
                    {loading ? "Rejecting..." : "Reject Request"}
                </Button>
                <div className="flex gap-2">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleApprove} disabled={loading}>
                        {loading ? "Approving..." : "Approve & Order"}
                    </Button>
                </div>
            </DialogFooter>
            </DialogContent>
      </Dialog>
    )
}

