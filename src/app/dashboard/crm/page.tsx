
"use client";

import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

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
import { useEffect, useState } from "react";
import { db, collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { LeadPipeline } from "@/components/lead-pipeline";
import { Textarea } from "@/components/ui/textarea";

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  assignedTo: string;
  createdAt: any;
  requirements: string;
}

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    requirements: "",
  });
  
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const leadsData: Lead[] = [];
      querySnapshot.forEach((doc) => {
        leadsData.push({ id: doc.id, ...doc.data() } as Lead);
      });
      setLeads(leadsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setNewLead(prev => ({ ...prev, [name]: value }));
  };

  const handleAddLead = async () => {
    if (!newLead.name || !newLead.email) {
      toast({ title: "Error", description: "Please fill name and email.", variant: "destructive" });
      return;
    }

    try {
      await addDoc(collection(db, "leads"), {
        ...newLead,
        status: "New",
        assignedTo: "Sales Rep", // Placeholder, ideally this would be the logged in user's name
        createdAt: serverTimestamp(),
      });
      toast({ title: "Success", description: "New lead added." });
      setIsDialogOpen(false);
      setNewLead({ name: "", email: "", phone: "", requirements: "" });
    } catch (error) {
      console.error("Error adding lead: ", error);
      toast({ title: "Error", description: "Could not add lead.", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Lead Pipeline</h1>
        </div>
        
        <LeadPipeline leads={leads} loading={loading} />
      </div>

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Fill in the details for the new customer lead.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={newLead.name} onChange={(e) => handleInputChange('name', e.target.value)} className="col-span-3" placeholder="e.g., John Doe" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={newLead.email} onChange={(e) => handleInputChange('email', e.target.value)} className="col-span-3" placeholder="e.g., john.doe@example.com" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input id="phone" value={newLead.phone} onChange={(e) => handleInputChange('phone', e.target.value)} className="col-span-3" placeholder="e.g., +1 234 567 890" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requirements" className="text-right">Requirements</Label>
              <Textarea id="requirements" value={newLead.requirements} onChange={(e) => handleInputChange('requirements', e.target.value)} className="col-span-3" placeholder="e.g., 3BHK, corner unit, high floor..." />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddLead}>Save Lead</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
