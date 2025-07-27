
'use client'

import {
  Activity,
  ArrowUpRight,
  ClipboardCheck,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Package,
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
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type Project } from "./projects/page";
import { collection, onSnapshot, query, orderBy, limit } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";

interface ActivityFeedItem {
  id: string;
  type: string;
  user: string;
  details: string;
  timestamp: any;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'owner') {
      router.push('/login');
    }
    
    const qProjects = query(collection(db, "projects"));
    const unsubscribeProjects = onSnapshot(qProjects, (querySnapshot) => {
      const projectsData: Project[] = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ id: doc.id, ...doc.data() } as Project);
      });
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects: ", error);
      toast({
        title: "Error fetching projects",
        description: "Could not retrieve project data.",
        variant: "destructive"
      })
      setLoading(false);
    });
    
    const qActivity = query(collection(db, "activityFeed"), orderBy("timestamp", "desc"), limit(5));
    const unsubscribeActivity = onSnapshot(qActivity, (querySnapshot) => {
      const feedData: ActivityFeedItem[] = [];
      querySnapshot.forEach((doc) => {
        feedData.push({ id: doc.id, ...doc.data() } as ActivityFeedItem);
      });
      setActivityFeed(feedData);
    });

    return () => {
        unsubscribeProjects();
        unsubscribeActivity();
    };
  }, [router, toast]);

  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalSpent = projects.reduce((acc, p) => acc + (p.spent || 0), 0);
  const onTrackProjects = projects.filter(p => (p.spent || 0) <= (p.budget || 0)).length;
  const overallProgress = projects.length > 0 ? projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length : 0;
  
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
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Owner's View</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Overall Progress
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Budget Status
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSpent.toLocaleString('en-IN')} / ₹{totalBudget.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Total spent vs. budget
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects on Track</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onTrackProjects} / {projects.length}</div>
            <p className="text-xs text-muted-foreground">
              {projects.length - onTrackProjects} project(s) over budget
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Team</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1 Site Manager</div>
            <p className="text-xs text-muted-foreground">
              + 12 Engineers & Staff
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Project Status</CardTitle>
              <CardDescription>
                High-level overview of project health.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/reports">
                View Reports
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Budget vs. Spent</TableHead>
                  <TableHead className="hidden md:table-cell">Progress</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading projects...</TableCell></TableRow>
                ) : (
                  projects.map(p => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="font-medium">{p.name}</div>
                      </TableCell>
                      <TableCell>
                          <div className="font-medium">₹{(p.spent || 0).toLocaleString('en-IN')} / <span className="text-muted-foreground">₹{(p.budget || 0).toLocaleString('en-IN')}</span></div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Progress value={p.progress || 0} aria-label={`${p.progress || 0}% complete`} />
                          <span>{p.progress || 0}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={(p.spent || 0) <= (p.budget || 0) ? "secondary" : "destructive"}>
                           {(p.spent || 0) <= (p.budget || 0) ? "On Track" : "Over Budget"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
            <CardHeader>
              <CardTitle>Recent Site Activity</CardTitle>
              <CardDescription>Real-time updates from all sites.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
                {activityFeed.length === 0 && !loading && (
                    <p className="text-sm text-muted-foreground text-center">No recent activity.</p>
                )}
                {activityFeed.map(item => (
                    <div className="flex items-center gap-4" key={item.id}>
                        <Avatar className="hidden h-9 w-9 sm:flex">
                        <AvatarImage src={`https://i.pravatar.cc/40?u=${item.user}`} alt="Avatar" />
                        <AvatarFallback>{item.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="grid gap-1">
                        <p className="text-sm font-medium leading-none">{item.user}</p>
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
    </>
  );
}
