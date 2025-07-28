
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, TrendingUp, Flame, Sun, Snowflake, CheckCircle } from "lucide-react";
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

        const qLeads = query(collection(db, "leads"));
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
    const hotLeads = leads.filter(l => l.status === 'Hot').length;
    const warmLeads = leads.filter(l => l.status === 'Warm').length;
    const coldLeads = leads.filter(l => l.status === 'Cold').length;
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
                        <p className="text-xs text-muted-foreground">From all booked deals</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Booked Deals</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalBooked}</div>
                        <p className="text-xs text-muted-foreground">Successfully closed leads</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalLeads}</div>
                        <p className="text-xs text-muted-foreground">Across all stages</p>
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
                    <CardTitle>Sales Funnel</CardTitle>
                    <CardDescription>
                        A snapshot of where leads are in the pipeline.
                    </CardDescription>
                </CardHeader>
                 <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="p-4 bg-red-500/10 rounded-lg text-center">
                        <Flame className="mx-auto h-6 w-6 mb-2 text-red-500" />
                        <p className="text-2xl font-bold">{hotLeads}</p>
                        <p className="text-sm text-red-500/80 font-semibold">Hot Leads</p>
                    </div>
                     <div className="p-4 bg-yellow-500/10 rounded-lg text-center">
                        <Sun className="mx-auto h-6 w-6 mb-2 text-yellow-500" />
                        <p className="text-2xl font-bold">{warmLeads}</p>
                        <p className="text-sm text-yellow-500/80 font-semibold">Warm Leads</p>
                    </div>
                     <div className="p-4 bg-blue-500/10 rounded-lg text-center">
                        <Snowflake className="mx-auto h-6 w-6 mb-2 text-blue-500" />
                        <p className="text-2xl font-bold">{coldLeads}</p>
                        <p className="text-sm text-blue-500/80 font-semibold">Cold Leads</p>
                    </div>
                     <div className="p-4 bg-green-500/10 rounded-lg text-center">
                        <TrendingUp className="mx-auto h-6 w-6 mb-2 text-green-500" />
                        <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
                        <p className="text-sm text-green-500/80 font-semibold">Conversion Rate</p>
                    </div>
                </CardContent>
            </Card>

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
