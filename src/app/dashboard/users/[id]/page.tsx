
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
import { ArrowLeft, Mail, User, Shield, Activity, Users, CheckCircle, DollarSign, Briefcase, GanttChartSquare } from 'lucide-react';
import { type Lead } from '../../crm/page';
import { type Project } from '../../owner/projects/page';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SalesRepStats {
    assignedLeads: number;
    qualifiedLeads: number;
    revenue: number; // Placeholder
}

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<SalesRepStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== 'string') return;
    
    const userUnsub = onSnapshot(doc(db, 'users', id), (doc) => {
        if (doc.exists()) {
          const userData = { id: doc.id, ...doc.data() } as UserProfile;
          setUser(userData);
          
          if (userData.role === 'salesrep') {
            fetchLeads(userData.name);
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
        
        const qualifiedLeads = userLeads.filter(l => l.status === 'Qualified').length;
        setStats({
            assignedLeads: userLeads.length,
            qualifiedLeads: qualifiedLeads,
            revenue: qualifiedLeads * 750000 // Placeholder calculation
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

    return () => userUnsub();
  }, [id, router]);

  if (loading) {
    return <UserProfileSkeleton />;
  }

  if (!user) {
    return <div>User not found.</div>;
  }

  return (
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
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                         <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-semibold">{user.name}</h2>
                        <p className="text-muted-foreground">{user.email}</p>
                        <Badge className="mt-2 capitalize" variant={user.role === 'owner' ? 'default' : 'secondary'}>{user.role}</Badge>
                    </div>
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
                            <span className="font-semibold">{stats.qualifiedLeads}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-muted-foreground"><DollarSign className="h-4 w-4" /><span>Revenue (Est.)</span></div>
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
                                 <div key={p.id} className="text-sm p-2 bg-muted rounded-md cursor-pointer hover:bg-muted/80" onClick={() => router.push(`/dashboard/owner/projects/${p.id}`)}>{p.name}</div>
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
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {leads.length > 0 ? leads.map(lead => (
                                    <TableRow key={lead.id} onClick={() => router.push(`/dashboard/crm/${lead.id}`)} className="cursor-pointer">
                                        <TableCell>{lead.name}</TableCell>
                                        <TableCell><Badge variant="outline">{lead.status}</Badge></TableCell>
                                        <TableCell className="truncate text-muted-foreground max-w-xs">{lead.requirements}</TableCell>
                                    </TableRow>
                                )) : <TableRow><TableCell colSpan={3} className="text-center">No leads assigned.</TableCell></TableRow>}
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
                <div className="lg:col-span-1">
                    <Card>
                        <CardContent className="pt-6 flex flex-col items-center">
                            <Skeleton className="h-24 w-24 rounded-full mb-4" />
                            <Skeleton className="h-6 w-32 mb-2" />
                            <Skeleton className="h-4 w-40 mb-2" />
                            <Skeleton className="h-6 w-20" />
                        </CardContent>
                    </Card>
                </div>
                 <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                             <Skeleton className="h-6 w-40 mb-2" />
                             <Skeleton className="h-4 w-56" />
                        </CardHeader>
                         <CardContent>
                            <Skeleton className="h-24 w-full" />
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-40 mb-2" />
                            <Skeleton className="h-4 w-56" />
                        </CardHeader>
                         <CardContent>
                             <Skeleton className="h-12 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
