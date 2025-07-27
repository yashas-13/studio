
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Mail, Phone, User, Activity, TrendingUp } from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Lost';
  assignedTo: string;
}

export default function LeadProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <LeadProfileSkeleton />;
  }

  if (!lead) {
    return <div>Lead not found.</div>;
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
                        <Badge className="mt-2 capitalize" variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
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
                        <CardTitle>Performance Metrics</CardTitle>
                        <CardDescription>Overall engagement and conversion metrics for this lead.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground text-center">Performance metrics coming soon.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>A log of all interactions with this lead.</CardDescription>
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
