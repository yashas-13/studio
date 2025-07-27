
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";
import { type Lead } from "../../crm/page";
import { Skeleton } from "@/components/ui/skeleton";
import SalesRepresentativeCard from "@/components/sales-representative-card";

interface RawSalesRep {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function SalesAnalyticsPage() {
    const [salesReps, setSalesReps] = useState<RawSalesRep[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const usersQuery = query(collection(db, "users"), where("role", "==", "salesrep"));
        const repsUnsub = onSnapshot(usersQuery, (snapshot) => {
            const repsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as RawSalesRep[];
            setSalesReps(repsData);
        });

        const qLeads = query(collection(db, "leads"), orderBy("createdAt", "desc"));
        const leadsUnsub = onSnapshot(qLeads, (snapshot) => {
            const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
            setLeads(leadsData);
            setLoading(false);
        });

        return () => {
          repsUnsub();
          leadsUnsub();
        };
    }, []);

    const totalLeads = leads.length;
    const totalBooked = leads.filter(l => l.status === 'Booked').length;
    const totalRevenue = leads.filter(l => l.status === 'Booked').reduce((acc, lead) => acc + (lead.price || 0), 0);
    const conversionRate = totalLeads > 0 ? (totalBooked / totalLeads) * 100 : 0;

    const renderSkeleton = () => (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
             {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                             <Skeleton className="h-12 w-12 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-40" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
             ))}
        </div>
    );

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">Sales Analytics</h1>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString('en-IN')}</div>
                        <p className="text-xs text-muted-foreground">From all sales activities</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalLeads}</div>
                        <p className="text-xs text-muted-foreground">Across the team</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Overall Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Leads to booked deals</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sales Team</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{salesReps.length}</div>
                        <p className="text-xs text-muted-foreground">Representatives</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Sales Representative Performance</CardTitle>
                    <CardDescription>
                        An overview of each representative's sales activities.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? renderSkeleton() : (
                         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                           {salesReps.map(rep => {
                                const repLeads = leads.filter(lead => lead.assignedTo === rep.name);
                                return <SalesRepresentativeCard key={rep.id} rep={rep} leads={repLeads} />
                           })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
