
"use client";

import { useEffect, useState } from "react";
import { db, collection, onSnapshot, query, where } from "@/lib/firebase";
import { LeadKanbanBoard } from "@/components/lead-kanban-board";
import { useToast } from "@/hooks/use-toast";
import { List, LayoutGrid } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LeadList } from "@/components/lead-list";

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
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('board');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const { toast } = useToast();
  
  useEffect(() => {
    const q = query(collection(db, "leads"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const leadsData: Lead[] = [];
      querySnapshot.forEach((doc) => {
        leadsData.push({ id: doc.id, ...doc.data() } as Lead);
      });
      setAllLeads(leadsData);
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

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredLeads(allLeads);
    } else {
      setFilteredLeads(allLeads.filter(lead => lead.status === statusFilter));
    }
  }, [statusFilter, allLeads]);


  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Lead Management Pipeline</h1>
        <div className="ml-auto flex items-center gap-4">
            {view === 'list' && (
                 <Select value={statusFilter} onValueChange={(v: LeadStatus | 'all') => setStatusFilter(v)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Warm">Warm</SelectItem>
                        <SelectItem value="Hot">Hot</SelectItem>
                        <SelectItem value="Cold">Cold</SelectItem>
                        <SelectItem value="Booked">Booked</SelectItem>
                    </SelectContent>
                </Select>
            )}
            <ToggleGroup type="single" value={view} onValueChange={(v) => { if (v) setView(v)}}>
                <ToggleGroupItem value="board" aria-label="Toggle board view">
                    <LayoutGrid className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="list" aria-label="Toggle list view">
                    <List className="h-4 w-4" />
                </ToggleGroupItem>
            </ToggleGroup>
        </div>
      </div>
      {view === 'board' ? (
        <LeadKanbanBoard leads={allLeads} loading={loading} />
      ) : (
        <LeadList leads={filteredLeads} loading={loading} />
      )}
    </div>
  );
}
