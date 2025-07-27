
"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  CheckCircle,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type Lead } from "../crm/page";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface ActivityFeedItem {
    id: string;
    details: string;
    timestamp: any;
    leadName: string;
  }
  
const upcomingFollowUps = [
    { leadName: "Rohan Verma", task: "Call to discuss final quote", due: "Tomorrow" },
    { leadName: "Priya Desai", task: "Send floor plan options", due: "Today" },
    { leadName: "Amit Patel", task: "Schedule site visit", due: "In 3 days" },
];

export default function SalesDashboardPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const qLeads = query(collection(db, "leads"), orderBy("createdAt", "desc"));
        const unsubscribeLeads = onSnapshot(qLeads, (snapshot) => {
          const leadsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lead[];
          setLeads(leadsData);
          setLoading(false);
        });
    
        // This is a placeholder for a more sophisticated activity feed.
        // For now, it mirrors recent lead creations.
        const qActivity = query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(5));
        const unsubscribeActivity = onSnapshot(qActivity, (snapshot) => {
          const feedData = snapshot.docs.map(doc => ({
            id: doc.id,
            details: `New lead assigned.`,
            leadName: doc.data().name,
            timestamp: doc.data().createdAt,
          })) as ActivityFeedItem[];
          setActivityFeed(feedData);
        });
    
        return () => {
            unsubscribeLeads();
            unsubscribeActivity();
        };
      }, []);

    const newLeadsCount = leads.filter(l => l.status === 'New').length;
    const qualifiedLeadsCount = leads.filter(l => l.status === 'Qualified').length;
    const closedDeals = 15; // Sample data for conversion rate
    const conversionRate = leads.length > 0 ? (closedDeals / leads.length) * 100 : 0;
    
    const formatTimestamp = (timestamp: any) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate();
        const now = new Date();
        const diff = Math.abs(now.getTime() - date.getTime());
        const diffHours = Math.floor(diff / (1000 * 60 * 60));
        
        if (diffHours < 1) return `${Math.floor(diff / (1000 * 60))}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Sales Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
            <p className="text-xs text-muted-foreground">Your active leads</p>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Leads</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{newLeadsCount}</div>
                <p className="text-xs text-muted-foreground">Ready to be contacted</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Qualified</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{qualifiedLeadsCount}</div>
                <p className="text-xs text-muted-foreground">Hot leads in the pipeline</p>
            </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Based on sample closed deals</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Upcoming Follow-ups</CardTitle>
              <CardDescription>
                Tasks and reminders to keep you on track.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/crm">
                Manage Pipeline
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Lead</TableHead>
                    <TableHead>Task</TableHead>
                    <TableHead>Due</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {upcomingFollowUps.map((item, index) => (
                    <TableRow key={index}>
                        <TableCell>
                            <div className="font-medium">{item.leadName}</div>
                        </TableCell>
                        <TableCell>
                            <div className="text-muted-foreground">{item.task}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{item.due}</Badge>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
                A log of recent lead updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {loading ? <p>Loading activity...</p> : 
            activityFeed.map((item) => (
                <div className="flex items-center gap-4" key={item.id}>
                    <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={`https://i.pravatar.cc/40?u=${item.leadName}`} alt="Avatar" />
                        <AvatarFallback>{item.leadName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{item.leadName}</p>
                        <p className="text-sm text-muted-foreground">
                            {item.details}
                        </p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">{formatTimestamp(item.timestamp)}</div>
                </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
