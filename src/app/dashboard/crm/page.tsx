
"use client";

import { useEffect, useState } from "react";
import { db, collection, onSnapshot, query, orderBy } from "@/lib/firebase";
import { LeadKanbanBoard } from "@/components/lead-kanban-board";
import { useToast } from "@/hooks/use-toast";

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


export default function CrmPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const q = query(collection(db, "leads"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const leadsData: Lead[] = [];
      querySnapshot.forEach((doc) => {
        leadsData.push({ id: doc.id, ...doc.data() } as Lead);
      });
      setLeads(leadsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching leads:", error);
      toast({
        title: "Error",
        description: "Could not fetch leads.",
        variant: "destructive"
      });
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [toast]);


  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Lead Management Pipeline</h1>
      </div>
      <LeadKanbanBoard leads={leads} loading={loading} />
    </div>
  );
}
