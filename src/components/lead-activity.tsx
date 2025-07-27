
'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { addLeadNote } from '@/app/dashboard/crm/actions';
import { Activity, Briefcase, MessageSquare, PhoneCall, Users } from 'lucide-react';

interface ActivityItem {
    id: string;
    type: 'Status Change' | 'Note' | 'Call' | 'Meeting';
    content: string;
    date: any;
    user: string;
}

interface LeadActivityProps {
    leadId: string;
}

export default function LeadActivity({ leadId }: LeadActivityProps) {
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [newNote, setNewNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!leadId) return;
        const activityQuery = query(collection(db, 'leads', leadId, 'activity'), orderBy('date', 'desc'));
        const unsub = onSnapshot(activityQuery, (snapshot) => {
            const activitiesData: ActivityItem[] = [];
            snapshot.forEach(doc => {
                activitiesData.push({ id: doc.id, ...doc.data() } as ActivityItem);
            });
            setActivities(activitiesData);
        });

        return () => unsub();
    }, [leadId]);

    const handleAddNote = async () => {
        setIsSubmitting(true);
        try {
            await addLeadNote(leadId, newNote);
            setNewNote("");
            toast({ title: "Note added successfully!" });
        } catch (error) {
            console.error("Error adding note: ", error);
            toast({ title: "Error", description: "Could not add note.", variant: "destructive" });
        } finally {
            setIsSubmitting(false);
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
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Log an Activity</CardTitle>
                <CardDescription>Add a note, call log, or meeting summary.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid w-full gap-2">
                    <Textarea placeholder="Type your note here..." value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                    <Button onClick={handleAddNote} disabled={isSubmitting || !newNote.trim()}>
                        {isSubmitting ? 'Adding...' : 'Add Note'}
                    </Button>
                </div>
            </CardContent>
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
    );
}
