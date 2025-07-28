
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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { type Lead } from "@/app/dashboard/crm/page";
import { reassignLead } from "@/app/dashboard/crm/actions";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'sitemanager' | 'owner' | 'entryguard' | 'salesrep';
}

interface ReassignLeadDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    lead: Lead;
    currentUser: UserProfile;
    otherSalesReps: UserProfile[];
}

export function ReassignLeadDialog({ isOpen, onOpenChange, lead, currentUser, otherSalesReps }: ReassignLeadDialogProps) {
    const [selectedRepId, setSelectedRepId] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = async () => {
        if (!selectedRepId) {
            toast({ title: "Error", description: "Please select a sales representative.", variant: "destructive" });
            return;
        }
        setLoading(true);
        try {
            const newAssignee = otherSalesReps.find(rep => rep.id === selectedRepId);
            if (!newAssignee) {
                throw new Error("Selected representative not found.");
            }
            await reassignLead(lead.id, currentUser.name, newAssignee.name);
            toast({ title: "Success", description: `Lead ${lead.name} reassigned to ${newAssignee.name}.` });
            onOpenChange(false);
        } catch (error) {
            console.error("Error reassigning lead:", error);
            toast({ title: "Error", description: "Could not reassign lead.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setSelectedRepId("");
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
                <DialogTitle>Re-assign Lead: {lead.name}</DialogTitle>
                <DialogDescription>
                    Assign this lead to a different sales representative.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <p className="text-sm text-muted-foreground">Currently assigned to: <span className="font-medium text-foreground">{currentUser.name}</span></p>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sales-rep" className="text-right">New Assignee</Label>
                    <Select value={selectedRepId} onValueChange={setSelectedRepId}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a new representative" />
                        </SelectTrigger>
                        <SelectContent>
                            {otherSalesReps.length > 0 ? otherSalesReps.map(rep => (
                                <SelectItem key={rep.id} value={rep.id}>{rep.name}</SelectItem>
                            )) : <p className="p-4 text-sm text-muted-foreground">No other sales reps available.</p>}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={loading || !selectedRepId}>
                    {loading ? "Re-assigning..." : "Confirm Re-assignment"}
                </Button>
            </DialogFooter>
            </DialogContent>
      </Dialog>
    )
}
