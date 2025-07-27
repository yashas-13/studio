
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { db, collection, addDoc, onSnapshot, doc, deleteDoc, serverTimestamp, query, orderBy } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  assignedTo: string;
  createdAt: any;
}

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
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
      setNewLead({ name: "", email: "", phone: "" });
    } catch (error) {
      console.error("Error adding lead: ", error);
      toast({ title: "Error", description: "Could not add lead.", variant: "destructive" });
    }
  };
  
  const handleDeleteLead = async (id: string) => {
    try {
      await deleteDoc(doc(db, "leads", id));
      toast({title: "Success", description: "Lead deleted."});
    } catch (error) {
      console.error("Error deleting lead:", error);
      toast({title: "Error", description: "Could not delete lead.", variant: "destructive"});
    }
  }
  
  const getStatusVariant = (status: Lead['status']): "secondary" | "outline" | "default" | "destructive" => {
    switch (status) {
      case 'New': return 'default';
      case 'Contacted': return 'outline';
      case 'Qualified': return 'secondary';
      case 'Lost': return 'destructive';
      default: return 'default';
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">CRM Dashboard</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Lead
              </span>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Customer Leads</CardTitle>
            <CardDescription>
              Manage potential customers and track their status.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone || 'N/A'}</TableCell>
                    <TableCell><Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge></TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteLead(lead.id)} className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
           <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{leads.length}</strong> of <strong>{leads.length}</strong> leads
            </div>
          </CardFooter>
        </Card>
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
