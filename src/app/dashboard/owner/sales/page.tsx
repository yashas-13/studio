
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Users, TrendingUp } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { type Lead } from "../../crm/page";

interface SalesRep {
    id: string;
    name: string;
    email: string;
    leads: number;
    closed: number;
    revenue: number;
}

interface RawSalesRep {
    id: string;
    name: string;
    email: string;
}

export default function SalesAnalyticsPage() {
    const [rawSalesReps, setRawSalesReps] = useState<RawSalesRep[]>([]);
    const [leads, setLeads] = useState<Lead[]>([]);
    const [aggregatedReps, setAggregatedReps] = useState<SalesRep[]>([]);
    const [loading, setLoading] = useState(true);

    // Effect for fetching leads
    useEffect(() => {
        const leadsUnsub = onSnapshot(collection(db, "leads"), (snapshot) => {
            const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Lead));
            setLeads(leadsData);
            setLoading(false);
        });
        return () => leadsUnsub();
    }, []);

    // Effect for fetching sales reps
    useEffect(() => {
        const usersQuery = query(collection(db, "users"), where("role", "==", "salesrep"));
        const repsUnsub = onSnapshot(usersQuery, (snapshot) => {
            const repsData = snapshot.docs.map(doc => ({
                id: doc.id,
                name: doc.data().name,
                email: doc.data().email,
            })) as RawSalesRep[];
            setRawSalesReps(repsData);
            setLoading(false);
        });
        return () => repsUnsub();
    }, []);
    
    // Effect for aggregating data when either leads or rawReps change
    useEffect(() => {
        if (leads.length > 0 && rawSalesReps.length > 0) {
            const repsData = rawSalesReps.map(rep => {
                const assignedLeads = leads.filter(lead => lead.assignedTo === rep.name);
                const closedLeads = assignedLeads.filter(lead => lead.status === 'Qualified'); // Assuming qualified = closed for demo
                return {
                    ...rep,
                    leads: assignedLeads.length,
                    closed: closedLeads.length, 
                    revenue: closedLeads.length * 750000, // Placeholder calculation
                };
            });
            setAggregatedReps(repsData);
        } else if (rawSalesReps.length > 0) {
            // Handle case where there are reps but no leads yet
            setAggregatedReps(rawSalesReps.map(r => ({ ...r, leads: 0, closed: 0, revenue: 0 })));
        }
    }, [leads, rawSalesReps]);


    const totalLeads = aggregatedReps.reduce((acc, rep) => acc + rep.leads, 0);
    const totalClosed = aggregatedReps.reduce((acc, rep) => acc + rep.closed, 0);
    const totalRevenue = aggregatedReps.reduce((acc, rep) => acc + rep.revenue, 0);
    const conversionRate = totalLeads > 0 ? (totalClosed / totalLeads) * 100 : 0;

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
                        <CardTitle className="text-sm font-medium">Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">+{totalLeads}</div>
                        <p className="text-xs text-muted-foreground">This quarter</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Leads to closed deals</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Sales Team</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{rawSalesReps.length}</div>
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
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Representative</TableHead>
                                <TableHead className="text-center">Leads</TableHead>
                                <TableHead className="text-center">Closed Deals</TableHead>
                                <TableHead className="text-right">Revenue Generated</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">Loading performance data...</TableCell>
                                </TableRow>
                            ) : (
                                aggregatedReps.map(rep => (
                                    <TableRow key={rep.email}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={`https://i.pravatar.cc/40?u=${rep.email}`} alt={rep.name} />
                                                    <AvatarFallback>{rep.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{rep.name}</div>
                                                    <div className="text-sm text-muted-foreground">{rep.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center font-medium">{rep.leads}</TableCell>
                                        <TableCell className="text-center font-medium">{rep.closed}</TableCell>
                                        <TableCell className="text-right font-semibold">₹{rep.revenue.toLocaleString('en-IN')}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

    