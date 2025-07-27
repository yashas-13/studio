
"use client";

import { useEffect, useState } from "react";
import { db, collection, onSnapshot, query, orderBy } from "@/lib/firebase";
import { LeadPipeline } from "@/components/lead-pipeline";

export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
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
}

export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const leadsData: Lead[] = [];
      querySnapshot.forEach((doc) => {
        leadsData.push({ id: doc.id, ...doc.data() } as Lead);
      });
      setLeads(leadsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <>
      <div className="flex flex-col gap-6 h-full">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Lead Pipeline</h1>
        </div>
        
        <LeadPipeline leads={leads} loading={loading} />
      </div>
    </>
  );
}
