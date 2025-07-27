
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { PlusCircle, MoreHorizontal, Users, UserPlus, CheckCircle, TrendingUp, ArrowUpDown } from "lucide-react";
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
import { useEffect, useState, useMemo } from "react";
import { db, collection, addDoc, onSnapshot, doc, deleteDoc, serverTimestamp, query, orderBy } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  assignedTo: string;
  createdAt: any;
}

type SortKey = keyof Lead;

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>({ key: 'createdAt', direction: 'descending' });
  
  const { toast } = useToast();
  const router = useRouter();

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

  const requestSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredLeads = useMemo(() => {
    let filteredLeads = [...leads];
    
    // Filter by status
    if (statusFilter !== 'All') {
      filteredLeads = filteredLeads.filter(lead => lead.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      filteredLeads = filteredLeads.filter(lead =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortConfig !== null) {
      filteredLeads.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    
    return filteredLeads;
  }, [leads, statusFilter, searchTerm, sortConfig]);

  const newLeadsCount = leads.filter(l => l.status === 'New').length;
  const qualifiedLeadsCount = leads.filter(l => l.status === 'Qualified').length;
  const closedDeals = 15; // Sample data for conversion rate
  const conversionRate = leads.length > 0 ? (closedDeals / leads.length) * 100 : 0;


  return (
    <>
      <div className="flex flex-col gap-6">
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

        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{leads.length}</div>
                    <p className="text-xs text-muted-foreground">All customer leads in the pipeline</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">+{newLeadsCount}</div>
                    <p className="text-xs text-muted-foreground">Leads that need to be contacted</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Qualified Leads</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{qualifiedLeadsCount}</div>
                    <p className="text-xs text-muted-foreground">Leads ready for a sales pitch</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Based on sample closed deals</p>
                </CardContent>
            </Card>
        </div>
        
        <Card>
          <CardHeader>
             <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <CardTitle>Customer Leads</CardTitle>
                    <CardDescription>
                    Manage potential customers and track their status.
                    </CardDescription>
                </div>
                <div className="flex gap-2">
                     <Input 
                        placeholder="Filter by name or email..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="max-w-sm"
                     />
                     <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="All">All Statuses</SelectItem>
                            <SelectItem value="New">New</SelectItem>
                            <SelectItem value="Contacted">Contacted</SelectItem>
                            <SelectItem value="Qualified">Qualified</SelectItem>
                            <SelectItem value="Lost">Lost</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </CardHeader>
          <CardContent>
             <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('name')}>
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                     <Button variant="ghost" onClick={() => requestSort('email')}>
                        Email
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => requestSort('status')}>
                        Status
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAndFilteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => router.push(`/dashboard/crm/${lead.id}`)}>
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone || 'N/A'}</TableCell>
                    <TableCell><Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge></TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button aria-haspopup="true" size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => router.push(`/dashboard/crm/${lead.id}`)}>View Details</DropdownMenuItem>
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
              Showing <strong>{sortedAndFilteredLeads.length}</strong> of <strong>{leads.length}</strong> leads
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
