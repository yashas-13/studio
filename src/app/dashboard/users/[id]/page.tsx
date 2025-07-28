
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Mail, User, Shield, Activity, Users, CheckCircle, DollarSign, Briefcase, GanttChartSquare, Edit, Save, X } from 'lucide-react';
import { type Lead } from '../../crm/page';
import { type Project } from '../../owner/projects/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '../actions';
import { ReassignLeadDialog } from '@/components/reassign-lead-dialog';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'sitemanager' | 'owner' | 'entryguard' | 'salesrep';
}

interface SalesRepStats {
    assignedLeads: number;
    bookedLeads: number;
    revenue: number;
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const { toast } = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [allSalesReps, setAllSalesReps] = useState<UserProfile[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<SalesRepStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({});
  const [isReassignDialogOpen, setIsReassignDialogOpen] = useState(false);
  const [leadToReassign, setLeadToReassign] = useState<Lead | null>(null);

  useEffect(() => {
    if (typeof id !== 'string') return;
    
    const userUnsub = onSnapshot(doc(db, 'users', id), (doc) => {
        if (doc.exists()) {
          const userData = { id: doc.id, ...doc.data() } as UserProfile;
          setUser(userData);
          
          if (userData.role === 'salesrep') {
            fetchLeads(userData.name);
            fetchAllSalesReps();
          } else if (userData.role === 'sitemanager') {
            fetchProjects(userData.name);
          } else {
            setLoading(false);
          }

        } else {
          router.push('/dashboard/users');
          setLoading(false);
        }
      });

    const fetchLeads = async (userName: string) => {
        const q = query(collection(db, "leads"), where("assignedTo", "==", userName));
        const leadSnapshot = await getDocs(q);
        const userLeads = leadSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
        setLeads(userLeads);
        
        const bookedLeads = userLeads.filter(l => l.status === 'Booked');
        const revenue = bookedLeads.reduce((acc, lead) => acc + (lead.price || 0), 0);

        setStats({
            assignedLeads: userLeads.length,
            bookedLeads: bookedLeads.length,
            revenue: revenue
        });
        setLoading(false);
    }
    
    const fetchProjects = async (userName: string) => {
        const q = query(collection(db, "projects"), where("siteEngineer", "==", userName));
        const projectSnapshot = await getDocs(q);
        const userProjects = projectSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
        setProjects(userProjects);
        setLoading(false);
    }
    
    const fetchAllSalesReps = async () => {
        const q = query(collection(db, "users"), where("role", "==", "salesrep"));
        const repsSnapshot = await getDocs(q);
        const repsData = repsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserProfile));
        setAllSalesReps(repsData);
    }

    return () => userUnsub();
  }, [id, router]);

  const handleEditToggle = () => {
    if (!user) return;
    if (!isEditing) {
        setEditedUser({
            name: user.name,
            email: user.email,
            role: user.role,
        });
    }
    setIsEditing(!isEditing);
  }

  const handleInputChange = (field: keyof UserProfile, value: string) => {
      setEditedUser(prev => ({ ...prev, [field]: value }));
  }
  
  const handleSave = async () => {
    if (!user || !editedUser.name || !editedUser.email || !editedUser.role) {
        toast({ title: "Error", description: "All fields are required.", variant: "destructive" });
        return;
    }
    try {
        await updateUser(user.id, {
            name: editedUser.name,
            email: editedUser.email,
            role: editedUser.role,
        });
        toast({ title: "Success", description: "User details updated." });
        setIsEditing(false);
    } catch (error) {
        console.error("Error updating user:", error);
        toast({ title: "Error", description: "Could not update user.", variant: "destructive" });
    }
  }

  const handleReassignClick = (lead: Lead) => {
    setLeadToReassign(lead);
    setIsReassignDialogOpen(true);
  }


  if (loading) {
    return <UserProfileSkeleton />;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
    <>
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div>
            <h1 className="text-2xl font-semibold">User Profile</h1>
            <p className="text-sm text-muted-foreground">Detailed view of user information and activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
             <Card>
                <CardHeader>
                    <div className='flex justify-between items-start'>
                        <CardTitle>User Details</CardTitle>
                        <Button variant="ghost" size="icon" onClick={handleEditToggle}>
                            {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="flex flex-col items-center text-center">
                         <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {isEditing ? (
                            <Input className='text-xl font-semibold text-center mb-2' value={editedUser.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                        ) : (
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                        )}
                    </div>
                     <div className="mt-6 space-y-3 text-sm">
                        {isEditing ? (
                            <>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input type="email" id="email" value={editedUser.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                            </div>
                            <div className="grid w-full items-center gap-1.5">
                                <Label htmlFor="role">Role</Label>
                                <Select value={editedUser.role} onValueChange={(value: UserProfile['role']) => handleInputChange('role', value)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="sitemanager">Site Manager</SelectItem>
                                        <SelectItem value="owner">Owner</SelectItem>
                                        <SelectItem value="entryguard">Entry Guard</SelectItem>
                                        <SelectItem value="salesrep">Sales Representative</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            </>

                        ) : (
                            <>
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Shield className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground capitalize">{user.role}</span>
                            </div>
                            </>
                        )}
                    </div>
                     {isEditing && (
                        <Button onClick={handleSave} className="w-full mt-4">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                        </Button>
                    )}
                </CardContent>
            </Card>
            {user.role === 'salesrep' && stats && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sales Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4" /><span>Leads Assigned</span></div>
                            <span className="font-semibold">{stats.assignedLeads}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground"><CheckCircle className="h-4 w-4" /><span>Deals Closed</span></div>
                            <span className="font-semibold">{stats.bookedLeads}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground"><DollarSign className="h-4 w-4" /><span>Revenue Generated</span></div>
                            <span className="font-semibold">₹{stats.revenue.toLocaleString('en-IN')}</span>
                        </div>
                    </CardContent>
                </Card>
            )}
             {user.role === 'sitemanager' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Project Assignments</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground"><GanttChartSquare className="h-4 w-4" /><span>Active Projects</span></div>
                            <span className="font-semibold">{projects.length}</span>
                        </div>
                         <p className="text-xs text-muted-foreground pt-2">Manages the following projects:</p>
                         <div className="space-y-2">
                             {projects.length > 0 ? projects.map(p => (
                                <Link href={`/dashboard/owner/projects/${p.id}`} key={p.id}>
                                  <div className="text-sm p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80">{p.name}</div>
                                </Link>
                             )) : <p className="text-xs text-muted-foreground">No projects assigned.</p>}
                         </div>
                    </CardContent>
                </Card>
            )}
        </div>
        <div className="lg:col-span-2">
            <div className="grid gap-6">
                {user.role === 'salesrep' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Assigned Leads</CardTitle>
                        <CardDescription>All leads currently assigned to {user.name}.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Lead Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Requirements</TableHead>
                                    <TableHead className='text-right'>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.length > 0 ? leads.map(lead => (
                                    <TableRow key={lead.id}>
                                        <TableCell  onClick={() => router.push(`/dashboard/crm/${lead.id}`)} className="cursor-pointer font-medium">{lead.name}</TableCell>
                                        <TableCell><Badge variant="outline">{lead.status}</Badge></TableCell>
                                        <TableCell className="truncate text-muted-foreground max-w-xs">{lead.requirements}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleReassignClick(lead)}>Re-assign</Button>
                                        </TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={4} className="text-center">No leads assigned.</TableCell></TableRow>}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
                )}
                 <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>A log of the user's recent actions within the system.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-muted-foreground text-center">Activity log coming soon.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
    {leadToReassign && user &&(
        <ReassignLeadDialog
            isOpen={isReassignDialogOpen}
            onOpenChange={setIsReassignDialogOpen}
            lead={leadToReassign}
            currentUser={user}
            otherSalesReps={allSalesReps.filter(rep => rep.id !== user.id)}
        />
    )}
    </>
  );
}

function UserProfileSkeleton() {
    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
             <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center">
                            <Skeleton className="h-24 w-24 rounded-full mb-4" />
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-40 mb-2" />
                            <Skeleton className="h-6 w-20" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-full" />
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                             <Skeleton className="h-6 w-40 mb-2" />
                             <Skeleton className="h-4 w-56" />
                        </CardHeader>
                         <CardContent>
                            <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
