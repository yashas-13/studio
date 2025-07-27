
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { type Lead } from "@/app/dashboard/crm/page";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import Link from "next/link";
import { Mail, Phone, User, FileText, Building } from "lucide-react";
import { useRouter } from "next/navigation";

interface LeadListProps {
  leads: Lead[];
  loading: boolean;
}

export function LeadList({ leads, loading }: LeadListProps) {
    const router = useRouter();

    const getStatusVariant = (status: Lead['status']): "secondary" | "outline" | "default" | "destructive" => {
        switch (status) {
          case 'Warm': return 'default';
          case 'Hot': return 'secondary';
          case 'Cold': return 'destructive';
          case 'Booked': return 'outline';
          default: return 'default';
        }
    }

  const renderLeadCard = (lead: Lead) => (
    <Card 
        key={lead.id} 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => router.push(`/dashboard/crm/${lead.id}`)}
    >
      <CardHeader className="pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center gap-3">
             <Avatar>
                <AvatarImage src={`https://i.pravatar.cc/40?u=${lead.email}`} />
                <AvatarFallback>{lead.name.charAt(0)}</AvatarFallback>
            </Avatar>
            {lead.name}
        </CardTitle>
        <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
         <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{lead.email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>{lead.phone || 'N/A'}</span>
        </div>
        <div className="flex items-start gap-2 text-muted-foreground">
            <FileText className="h-4 w-4 mt-0.5 shrink-0" />
            <p className="line-clamp-2">{lead.requirements || 'No requirements specified.'}</p>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground justify-between">
          <div className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span>Project: {lead.projectName || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>Assigned to: {lead.assignedTo}</span>
          </div>
      </CardFooter>
    </Card>
  );

  const renderSkeleton = () => (
    <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
             <Card key={i}>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-4 w-1/3" />
                </CardFooter>
             </Card>
        ))}
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        [...Array(3)].map((_, i) => (
          <div key={i}>
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-4 w-1/3" />
                </CardFooter>
             </Card>
          </div>
        ))
      ) : leads.length > 0 ? (
        leads.map(renderLeadCard)
      ) : (
        <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No leads found for this stage.</p>
        </div>
      )}
    </div>
  );
}
