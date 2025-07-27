
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot, updateDoc, collection, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Mail, Phone, User, Activity, TrendingUp, MessageSquare, Briefcase, PhoneCall, Users, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { type LeadStatus } from '../page';
import { Textarea } from '@/components/ui/textarea';


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
    id: string;
    type: 'Status Change' | 'Note' | 'Call' | 'Meeting';
    content: string;
    date: any;
    user: string;
}

export default function LeadProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (typeof id !== 'string') return;
    
    const leadUnsub = onSnapshot(doc(db, 'leads', id), (doc) => {
        if (doc.exists()) {
          setLead({ id: doc.id, ...doc.data() } as Lead);
        } else {
          router.push('/dashboard/crm');
        }
        setLoading(false);
      });

    const activityQuery = query(collection(db, 'leads', id, 'activity'), orderBy('date', 'desc'));
    const activityUnsub = onSnapshot(activityQuery, (snapshot) => {
        const activitiesData: ActivityItem[] = [];
        snapshot.forEach(doc => {
            activitiesData.push({ id: doc.id, ...doc.data() } as ActivityItem);
        });
        setActivities(activitiesData);
    });

    return () => {
        leadUnsub();
        activityUnsub();
    };
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
        
        // Log status change activity
        await addDoc(collection(db, 'leads', lead.id, 'activity'), {
            type: 'Status Change',
            content: `Status changed to ${newStatus}.`,
            date: serverTimestamp(),
            user: 'Anjali Sharma' // Placeholder user
        });

        toast({ title: "Status Updated", description: `${lead.name}'s status changed to ${newStatus}.`});
    } catch (error) {
        console.error("Error updating status: ", error);
        toast({ title: "Error", description: "Could not update lead status.", variant: "destructive" });
    }
  }

  const handleAddNote = async () => {
      if (!newNote.trim() || !lead) return;
      setIsSubmittingNote(true);
      try {
        await addDoc(collection(db, 'leads', lead.id, 'activity'), {
            type: 'Note',
            content: newNote,
            date: serverTimestamp(),
            user: 'Anjali Sharma' // Placeholder user
        });
        setNewNote("");
        toast({ title: "Note added successfully!" });
      } catch (error) {
        console.error("Error adding note: ", error);
        toast({ title: "Error", description: "Could not add note.", variant: "destructive" });
      } finally {
        setIsSubmittingNote(false);
      }
  };
  
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
        case 'Status Change': return <Briefcase className="h-4 w-4" />;
        case 'Note': return <MessageSquare className="h-4 w-4" />;
        case 'Call': return <PhoneCall className="h-4 w-4" />;
        case 'Meeting': return <Users className="h-4 w-4" />;
        default: return <Activity className="h-4 w-4" />;
    }
  }
  
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
        <div className="lg:col-span-1 space-y-6">
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
             <Card>
                <CardHeader>
                    <CardTitle>Lead Requirements</CardTitle>
                    <CardDescription>Specific needs and preferences.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        {lead.requirements || "No specific requirements have been logged."}
                    </p>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Log an Activity</CardTitle>
                    <CardDescription>Add a note, call log, or meeting summary.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid w-full gap-2">
                        <Textarea placeholder="Type your note here..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                        <Button onClick={handleAddNote} disabled={isSubmittingNote || !newNote.trim()}>
                            {isSubmittingNote ? 'Adding...' : 'Add Note'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Follow-Up History</CardTitle>
                    <CardDescription>A log of all interactions with this lead.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-6">
                        {activities.length > 0 ? activities.map((activity) => (
                            <div key={activity.id} className="flex gap-4">
                                <div className="p-3 rounded-full bg-muted text-muted-foreground h-fit">
                                    {getActivityIcon(activity.type)}
                                </div>
                                <div>
                                    <p className="font-medium text-sm">{activity.content}</p>
                                    <p className="text-xs text-muted-foreground">{activity.user} • {formatTimestamp(activity.date)}</p>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-muted-foreground text-center">No activities logged yet.</p>
                        )}
                     </div>
                </CardContent>
            </Card>
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
                        <CardHeader>
                             <Skeleton className="h-6 w-40 mb-2" />
                             <Skeleton className="h-4 w-56" />
                        </CardHeader>
                         <CardContent>
                            <Skeleton className="h-12 w-full" />
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
                             <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
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

    