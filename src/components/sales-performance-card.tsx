
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, DollarSign, TrendingUp, Users } from "lucide-react";

interface SalesPerformanceCardProps {
    totalLeads: number;
    bookedDeals: number;
    revenue: number;
    conversionRate: number;
}

export default function SalesPerformanceCard({ totalLeads, bookedDeals, revenue, conversionRate }: SalesPerformanceCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Your Performance Snapshot</CardTitle>
                <CardDescription>An overview of your sales activity.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                        <Users className="mx-auto h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{totalLeads}</p>
                        <p className="text-sm text-muted-foreground">Total Leads</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg text-center">
                        <CheckCircle className="mx-auto h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{bookedDeals}</p>
                        <p className="text-sm text-muted-foreground">Deals Closed</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg text-center">
                        <DollarSign className="mx-auto h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">₹{revenue.toLocaleString('en-IN')}</p>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                    </div>
                     <div className="p-4 bg-muted rounded-lg text-center">
                        <TrendingUp className="mx-auto h-6 w-6 mb-2 text-muted-foreground" />
                        <p className="text-2xl font-bold">{conversionRate.toFixed(1)}%</p>
                        <p className="text-sm text-muted-foreground">Conversion</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
