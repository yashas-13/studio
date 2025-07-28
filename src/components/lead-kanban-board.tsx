
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Lead, type LeadStatus } from "@/app/dashboard/crm/page";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { Mail, Phone, FileText } from "lucide-react";
import { Badge } from "./ui/badge";

interface LeadKanbanBoardProps {
  leads: Lead[];
  loading: boolean;
}

const columns: LeadStatus[] = ["Warm", "Hot", "Cold", "Booked"];

export function LeadKanbanBoard({ leads, loading }: LeadKanbanBoardProps) {

  const renderLeadCard = (lead: Lead) => (
    <Link href={`/dashboard/crm/${lead.id}`} key={lead.id}>
      <Card className="mb-4 hover:bg-muted/50 transition-colors">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">{lead.name}</CardTitle>
          <p className="text-xs text-muted-foreground pt-1">Assigned to: {lead.assignedTo}</p>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
           <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{lead.email}</span>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
                <FileText className="h-4 w-4 mt-0.5 shrink-0" />
                <p className="line-clamp-2">{lead.requirements || 'No requirements specified.'}</p>
            </div>
        </CardContent>
      </Card>
    </Link>
  );

  const renderSkeleton = () => (
    <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
             <Card key={i}>
                <CardHeader>
                    <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                </CardContent>
             </Card>
        ))}
    </div>
  )
  
  const getStatusColor = (status: LeadStatus) => {
    switch(status) {
        case 'Warm': return 'bg-yellow-500/20 border-yellow-500/80';
        case 'Hot': return 'bg-red-500/20 border-red-500/80';
        case 'Cold': return 'bg-blue-500/20 border-blue-500/80';
        case 'Booked': return 'bg-green-500/20 border-green-500/80';
    }
  }

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map(status => (
            <div key={status} className="bg-muted/30 rounded-lg h-full">
                <div className={`p-4 border-b-2 ${getStatusColor(status)} rounded-t-lg`}>
                    <h3 className="text-lg font-semibold flex justify-between">
                        {status}
                        <Badge variant="secondary" className="h-fit">{leads.filter(l => l.status === status).length}</Badge>
                    </h3>
                </div>
                <div className="p-4 space-y-4">
                    {loading 
                        ? renderSkeleton()
                        : leads.filter(p => p.status === status).length > 0
                            ? leads.filter(p => p.status === status).map(renderLeadCard)
                            : <p className="text-sm text-muted-foreground text-center pt-4">No leads in this stage.</p>
                    }
                </div>
            </div>
        ))}
    </div>
  );
}
