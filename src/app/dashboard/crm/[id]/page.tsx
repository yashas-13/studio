
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Mail, Phone, User, Activity, TrendingUp, MessageSquare, Briefcase, PhoneCall } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { type LeadStatus } from '../page';


interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  assignedTo: string;
  requirements: string;
}

interface ActivityItem {
    type: 'Status Change' | 'Note' | 'Call' | 'Meeting';
    content: string;
    date: string;
    user: string;
}

const sampleActivities: ActivityItem[] = [
    { type: 'Status Change', content: 'Status changed to Contacted.', date: '2 days ago', user: 'Anjali Sharma' },
    { type: 'Call', content: 'Initial call, discussed project details. Client is interested in 3BHK options.', date: '2 days ago', user: 'Anjali Sharma' },
    { type: 'Meeting', content: 'Scheduled a site visit for this weekend.', date: '1 day ago', user: 'Anjali Sharma' },
];


export default function LeadProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof id === 'string') {
      const unsub = onSnapshot(doc(db, 'leads', id), (doc) => {
        if (doc.exists()) {
          setLead({ id: doc.id, ...doc.data() } as Lead);
        } else {
          // Handle lead not found
          router.push('/dashboard/crm');
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, [id, router]);

  const getStatusVariant = (status: Lead['status']): "secondary" | "outline" | "default" | "destructive" => {
    switch (status) {
      case 'New': return 'default';
      case 'Contacted': return 'outline';
      case 'Qualified': return 'secondary';
      case 'Lost': return 'destructive';
      default: return 'default';
    }
  }

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (!lead) return;
    try {
        const leadRef = doc(db, 'leads', lead.id);
        await updateDoc(leadRef, { status: newStatus });
        toast({ title: "Status Updated", description: `${lead.name}'s status changed to ${newStatus}.`});
    } catch (error) {
        console.error("Error updating status: ", error);
        toast({ title: "Error", description: "Could not update lead status.", variant: "destructive" });
    }
  }
  
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
        case 'Status Change': return <Briefcase className="h-4 w-4" />;
        case 'Note': return <MessageSquare className="h-4 w-4" />;
        case 'Call': return <PhoneCall className="h-4 w-4" />;
        case 'Meeting': return <Users className="h-4 w-4" />;
        default: return <Activity className="h-4 w-4" />;
    }
  }

  if (loading) {
    return <LeadProfileSkeleton />;
  }

  if (!lead) {
    return <div>Lead not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
       <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div>
            <h1 className="text-2xl font-semibold">Lead Profile</h1>
            <p className="text-sm text-muted-foreground">Detailed view of customer information and activity.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
             <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                         <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${lead.email}`} alt={lead.name} />
                            <AvatarFallback>{lead.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-semibold">{lead.name}</h2>
                        <div className="mt-2">
                             <Select value={lead.status} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue>
                                         <Badge className="capitalize" variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="New">New</SelectItem>
                                    <SelectItem value="Contacted">Contacted</SelectItem>
                                    <SelectItem value="Qualified">Qualified</SelectItem>
                                    <SelectItem value="Lost">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                    <div className="mt-6 space-y-3 text-sm">
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{lead.email}</span>
                        </div>
                         <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{lead.phone || "Not provided"}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Assigned to: {lead.assignedTo}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2">
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Lead Requirements</CardTitle>
                        <CardDescription>Specific needs and preferences of the lead.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-sm">
                            {lead.requirements || "No specific requirements have been logged."}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Follow-Up History</CardTitle>
                        <CardDescription>A log of all interactions with this lead.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-6">
                            {sampleActivities.map((activity, index) => (
                                <div key={index} className="flex gap-4">
                                    <div className="p-3 rounded-full bg-muted text-muted-foreground h-fit">
                                        {getActivityIcon(activity.type)}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{activity.content}</p>
                                        <p className="text-xs text-muted-foreground">{activity.user} • {activity.date}</p>
                                    </div>
                                </div>
                            ))}
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}

function LeadProfileSkeleton() {
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
                            <Skeleton className="h-12 w-full" />
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
