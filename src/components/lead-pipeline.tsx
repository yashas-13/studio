
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type Lead, type LeadStatus } from "@/app/dashboard/crm/page";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface LeadPipelineProps {
  leads: Lead[];
  loading: boolean;
}

const columns: LeadStatus[] = ["New", "Contacted", "Qualified", "Lost"];

export function LeadPipeline({ leads, loading }: LeadPipelineProps) {
    const router = useRouter();

  const renderLeadCard = (lead: Lead) => (
    <Card 
        key={lead.id} 
        className="mb-4 hover:bg-muted/50 transition-colors cursor-pointer"
        onClick={() => router.push(`/dashboard/crm/${lead.id}`)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">{lead.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
         <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3 w-3" />
            <span>{lead.email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span>{lead.phone || 'N/A'}</span>
        </div>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">Assigned to: {lead.assignedTo}</span>
            </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => (
    <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
             <Card key={i}>
                <CardHeader className="pb-2">
                    <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
             </Card>
        ))}
    </div>
  )

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {columns.map(status => (
            <div key={status} className="bg-muted/40 rounded-lg p-4 h-full">
                <h3 className="text-lg font-semibold mb-4 text-center">{status}</h3>
                <div className="space-y-4">
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

    
