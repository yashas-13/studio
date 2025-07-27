
"use client";

import { type Lead } from "@/app/dashboard/crm/page";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CheckCircle, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface SalesRep {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface SalesRepresentativeCardProps {
    rep: SalesRep;
    leads: Lead[];
}

export default function SalesRepresentativeCard({ rep, leads }: SalesRepresentativeCardProps) {

    const bookedLeads = leads.filter(lead => lead.status === 'Booked');
    const revenue = bookedLeads.reduce((acc, lead) => acc + (lead.price || 0), 0);
    const recentLeads = leads.slice(0, 3);
    
    const getStatusVariant = (status: Lead['status']): "secondary" | "outline" | "default" | "destructive" => {
        switch (status) {
          case 'Warm': return 'default';
          case 'Hot': return 'secondary';
          case 'Cold': return 'destructive';
          case 'Booked': return 'outline';
          default: return 'default';
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://i.pravatar.cc/100?u=${rep.email}`} alt={rep.name} />
                        <AvatarFallback>{rep.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">{rep.name}</CardTitle>
                        <CardDescription>{rep.email}</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 bg-muted rounded-md">
                        <Users className="mx-auto h-5 w-5 mb-1" />
                        <p className="font-semibold">{leads.length}</p>
                        <p className="text-muted-foreground">Leads</p>
                    </div>
                     <div className="p-2 bg-muted rounded-md">
                        <CheckCircle className="mx-auto h-5 w-5 mb-1" />
                        <p className="font-semibold">{bookedLeads.length}</p>
                        <p className="text-muted-foreground">Closed</p>
                    </div>
                     <div className="p-2 bg-muted rounded-md">
                        <DollarSign className="mx-auto h-5 w-5 mb-1" />
                        <p className="font-semibold">₹{revenue.toLocaleString('en-IN', { notation: 'compact' })}</p>
                        <p className="text-muted-foreground">Revenue</p>
                    </div>
                </div>
                <div>
                    <h4 className="text-sm font-medium mb-2">Recent Leads</h4>
                    <div className="space-y-2">
                        {recentLeads.length > 0 ? recentLeads.map(lead => (
                             <Link href={`/dashboard/crm/${lead.id}`} key={lead.id} className="block">
                                <div className="p-2 border rounded-md hover:bg-muted/50 transition-colors">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium truncate">{lead.name}</p>
                                        <Badge variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
                                    </div>
                                     <p className="text-xs text-muted-foreground truncate">{lead.requirements}</p>
                                </div>
                            </Link>
                        )) : (
                            <p className="text-xs text-muted-foreground text-center py-2">No leads assigned yet.</p>
                        )}
                    </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                   <Link href={`/dashboard/users/${rep.id}`}>
                        View Full Profile <ArrowRight className="ml-2 h-4 w-4" />
                   </Link>
                </Button>
            </CardContent>
        </Card>
    )
}
