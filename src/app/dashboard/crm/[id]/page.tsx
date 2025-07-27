
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Skeleton } from '@/components/ui/skeleton';
import { type Lead } from '../page';
import LeadProfileHeader from '@/components/lead-profile-header';
import LeadDetailsCard from '@/components/lead-details-card';
import LeadRequirementsCard from '@/components/lead-requirements-card';
import LeadActions from '@/components/lead-actions';
import LeadActivity from '@/components/lead-activity';


export default function LeadProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id !== 'string') return;
    
    const leadUnsub = onSnapshot(doc(db, 'leads', id), (doc) => {
        if (doc.exists()) {
          const leadData = { id: doc.id, ...doc.data() } as Lead;
          setLead(leadData);
        } else {
          router.push('/dashboard/crm');
        }
        setLoading(false);
      });

    return () => {
        leadUnsub();
    };
  }, [id, router]);

  if (loading) {
    return <LeadProfileSkeleton />;
  }

  if (!lead) {
    return <div>Lead not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
       <LeadProfileHeader />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
            <LeadDetailsCard lead={lead} />
            <LeadRequirementsCard lead={lead} />
        </div>
        <div className="lg:col-span-2 space-y-6">
            <LeadActions lead={lead} />
            <LeadActivity leadId={lead.id} />
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

function Card({ children }: { children: React.ReactNode }) {
    return <div className="rounded-lg border bg-card text-card-foreground shadow-sm">{children}</div>
}
function CardHeader({ children }: { children: React.ReactNode }) {
    return <div className="flex flex-col space-y-1.5 p-6">{children}</div>
}
function CardContent({ children }: { children: React.ReactNode }) {
    return <div className="p-6 pt-0">{children}</div>
}
