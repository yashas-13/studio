
"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CheckCircle,
  PlusCircle,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { type Lead } from "../crm/page";
import { collection, onSnapshot, query, orderBy, limit, addDoc, serverTimestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { LeadAnalysisClient } from "@/components/client/lead-analysis-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Project } from "../owner/projects/page";
import SalesPerformanceCard from "@/components/sales-performance-card";

interface ActivityFeedItem {
    id: string;
    details: string;
    timestamp: any;
    leadName: string;
  }
  
interface FollowUpTask {
    id: string;
    leadName: string;
    task: string;
    due: string;
    status: "Overdue" | "Today" | "Upcoming";
}

export default function SalesDashboardPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
    const [upcomingFollowUps, setUpcomingFollowUps] = useState<FollowUpTask[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [userName, setUserName] = useState<string | null>(null);
    const [newLead, setNewLead] = useState({
      name: "",
      email: "",
      phone: "",
      requirements: "",
      projectId: "",
      unitType: "",
    });
    const { toast } = useToast();

    useEffect(() => {
        const loggedInUserName = localStorage.getItem('userName');
        setUserName(loggedInUserName);

        if (!loggedInUserName) return;

        const qLeads = query(collection(db, "leads"), where("assignedTo", "==", loggedInUserName));
        const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
          const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[];
          // Sort client-side
          leadsData.sort((a, b) => (b.createdAt?.toDate() || 0) > (a.createdAt?.toDate() || 0) ? 1 : -1);
          setLeads(leadsData);
          setLoading(false);
        });

        const qProjects = query(collection(db, "projects"), orderBy("createdAt", "desc"));
        const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
            const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
            setProjects(projectsData);
        });
    
        const qActivity = query(collection(db, "leads"), where("assignedTo", "==", loggedInUserName), orderBy("createdAt", "desc"), limit(5));
        const unsubscribeActivity = onSnapshot(qActivity, (snapshot) => {
          const feedData = snapshot.docs.map(doc => ({
            id: doc.id,
            details: `New lead assigned.`,
            leadName: doc.data().name,
            timestamp: doc.data().createdAt,
          })) as ActivityFeedItem[];
          setActivityFeed(feedData);
        });
        
        // Mock follow-up data fetching from a 'tasks' collection for example
        const qTasks = query(collection(db, "tasks"), where("assignee", "==", loggedInUserName));
        const unsubTasks = onSnapshot(qTasks, (snapshot) => {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            const followUps = snapshot.docs
              .map(doc => {
                const taskData = doc.data();
                if (!taskData.dueDate) return null;
                const dueDate = new Date(taskData.dueDate);
                let status: "Overdue" | "Today" | "Upcoming" = "Upcoming";
                if (dueDate < today) {
                    status = "Overdue";
                } else if (dueDate.getTime() === today.getTime()) {
                    status = "Today";
                }

                return {
                    id: doc.id,
                    leadName: taskData.leadName || 'N/A',
                    task: taskData.name,
                    due: dueDate.toLocaleDateString(),
                    status: status,
                }
              }).filter(doc => doc && doc.status !== 'Done') as FollowUpTask[];
            setUpcomingFollowUps(followUps);
        });
    
        return () => {
            unsubscribeLeads();
            unsubscribeProjects();
            unsubscribeActivity();
            unsubTasks();
        };
      }, []);

    const warmLeadsCount = leads.filter(l => l.status === 'Warm').length;
    const hotLeadsCount = leads.filter(l => l.status === 'Hot').length;
    const bookedLeadsCount = leads.filter(l => l.status === 'Booked').length;
    const totalRevenue = leads.filter(l => l.status === 'Booked').reduce((acc, lead) => acc + (lead.price || 0), 0);
    const conversionRate = leads.length > 0 ? (bookedLeadsCount / leads.length) * 100 : 0;
    
    const handleInputChange = (name: string, value: string) => {
      setNewLead(prev => ({ ...prev, [name]: value }));
    };

    const handleAddLead = async () => {
      if (!newLead.name || !newLead.email || !newLead.projectId) {
        toast({ title: "Error", description: "Please fill name, email and project.", variant: "destructive" });
        return;
      }
      if (!userName) {
        toast({ title: "Error", description: "Could not identify current user. Please login again.", variant: "destructive" });
        return;
      }

      try {
        const selectedProject = projects.find(p => p.id === newLead.projectId);
        
        const finalRequirements = newLead.unitType 
            ? `${newLead.unitType}. ${newLead.requirements}` 
            : newLead.requirements;

        await addDoc(collection(db, "leads"), {
          name: newLead.name,
          email: newLead.email,
          phone: newLead.phone,
          requirements: finalRequirements,
          projectId: newLead.projectId,
          projectName: selectedProject?.name,
          status: "Warm",
          assignedTo: userName, 
          createdAt: serverTimestamp(),
        });
        toast({ title: "Success", description: "New lead added." });
        setIsDialogOpen(false);
        setNewLead({ name: "", email: "", phone: "", requirements: "", projectId: "", unitType: "" });
      } catch (error) {
        console.error("Error adding lead: ", error);
        toast({ title: "Error", description: "Could not add lead.", variant: "destructive" });
      }
    };
    
    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate();
        const now = new Date();
        const diff = Math.abs(now.getTime() - date.getTime());
        const diffHours = Math.floor(diff / (1000 * 60 * 60));
        
        if (diffHours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    }
    
    const getStatusVariant = (status: string): "destructive" | "secondary" | "outline" => {
        switch(status) {
            case 'Overdue': return 'destructive';
            case 'Today': return 'secondary';
            case 'Upcoming':
            default:
                return 'outline';
        }
    }

  return (
    <>
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Sales Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Lead
              </span>
            </Button>
          </div>
      </div>
       <SalesPerformanceCard 
        totalLeads={leads.length}
        bookedDeals={bookedLeadsCount}
        revenue={totalRevenue}
        conversionRate={conversionRate}
      />
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Upcoming Follow-ups</CardTitle>
              <CardDescription>
                Tasks and reminders to keep you on track.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/crm">
                Manage Pipeline
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {upcomingFollowUps.map((item) => (
                    <TableRow key={item.id}>
                        <TableCell>
                            <div className="font-medium">{item.leadName}</div>
                        </TableCell>
                        <TableCell>
                            <div className="text-muted-foreground">{item.task}</div>
                        </TableCell>
                         <TableCell>
                            <div className="text-muted-foreground">{item.due}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                    {upcomingFollowUps.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center">No upcoming follow-ups.</TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
                A log of recent lead updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {loading ? <p>Loading activity...</p> : 
            activityFeed.map((item) => (
                <div className="flex items-center gap-4" key={item.id}>
                    <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={`https://i.pravatar.cc/40?u=${item.leadName}`} alt="Avatar" />
                        <AvatarFallback>{item.leadName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{item.leadName}</p>
                        <p className="text-sm text-muted-foreground">
                            {item.details}
                        </p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">{formatTimestamp(item.timestamp)}</div>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card className="xl:col-span-3">
        <CardHeader>
            <CardTitle>AI Lead Assistant</CardTitle>
            <CardDescription>Get AI-powered insights and next steps for a lead.</CardDescription>
        </CardHeader>
        <CardContent>
            <LeadAnalysisClient />
        </CardContent>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project" className="text-right">Project of Interest</Label>
              <Select value={newLead.projectId} onValueChange={(value) => handleInputChange('projectId', value)}>
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
                <Label htmlFor="unitType" className="text-right">Unit Type</Label>
                <Select value={newLead.unitType} onValueChange={(value) => handleInputChange('unitType', value)}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a unit type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1BHK">1BHK</SelectItem>
                        <SelectItem value="2BHK">2BHK</SelectItem>
                        <SelectItem value="3BHK">3BHK</SelectItem>
                        <SelectItem value="Penthouse">Penthouse</SelectItem>
                        <SelectItem value="Office Space">Office Space</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requirements" className="text-right">Requirements</Label>
              <Textarea id="requirements" value={newLead.requirements} onChange={(e) => handleInputChange('requirements', e.target.value)} className="col-span-3" placeholder="e.g., corner unit, high floor..." />
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
