
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

interface BlockUnitDialogProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    leads: Lead[];
    onBlockConfirm: (leadId: string, leadName: string) => void;
}

export function BlockUnitDialog({ isOpen, onOpenChange, leads, onBlockConfirm }: BlockUnitDialogProps) {
    const [selectedLeadId, setSelectedLeadId] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleSubmit = () => {
        if (!selectedLeadId) {
            toast({ title: "Error", description: "Please select a hot lead.", variant: "destructive" });
            return;
        }
        setLoading(true);
        const selectedLead = leads.find(l => l.id === selectedLeadId);
        if (selectedLead) {
            onBlockConfirm(selectedLead.id, selectedLead.name);
        }
        setLoading(false);
    };

    const handleClose = () => {
        onOpenChange(false);
        setSelectedLeadId("");
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
                <DialogTitle>Block Unit for Lead</DialogTitle>
                <DialogDescription>
                    Select a hot lead to book this unit for. This will change the unit's status to "Booked".
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lead" className="text-right">Hot Lead</Label>
                    <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select a lead" />
                        </SelectTrigger>
                        <SelectContent>
                            {leads.length > 0 ? leads.map(lead => (
                                <SelectItem key={lead.id} value={lead.id}>{lead.name}</SelectItem>
                            )) : <p className="p-4 text-sm text-muted-foreground">No hot leads found.</p>}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleSubmit} disabled={loading || !selectedLeadId}>
                    {loading ? "Booking..." : "Confirm Booking"}
                </Button>
            </DialogFooter>
            </DialogContent>
      </Dialog>
    )
}
