
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db, collection, onSnapshot, query, orderBy, where } from "@/lib/firebase";
import { LeadList } from "@/components/lead-list";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export type LeadStatus = 'Warm' | 'Hot' | 'Cold' | 'Booked';
export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  assignedTo: string;
  createdAt: any;
  requirements: string;
  projectId?: string;
  projectName?: string;
  price?: number;
}

function CrmPageComponent() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') as LeadStatus | 'all' | null;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    let q;
    if (status && status !== 'all') {
      q = query(collection(db, "leads"), where("status", "==", status), orderBy("createdAt", "desc"));
    } else {
      q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const leadsData: Lead[] = [];
      querySnapshot.forEach((doc) => {
        leadsData.push({ id: doc.id, ...doc.data() } as Lead);
      });
      setLeads(leadsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [status]);

  const tabs: (LeadStatus | 'all')[] = ['all', 'Warm', 'Hot', 'Cold', 'Booked'];

  return (
    <>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Lead Management</h1>
        </div>
        
        <Tabs value={status || 'all'}>
          <TabsList>
            {tabs.map(tab => (
              <Link href={tab === 'all' ? '/dashboard/crm' : `/dashboard/crm?status=${tab}`} key={tab}>
                <TabsTrigger value={tab}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </TabsTrigger>
              </Link>
            ))}
          </TabsList>
        </Tabs>

        <LeadList leads={leads} loading={loading} />
      </div>
    </>
  );
}

export default function CrmPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CrmPageComponent />
    </Suspense>
  )
}
