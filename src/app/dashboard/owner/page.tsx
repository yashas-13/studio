
'use client'

import {
  Activity,
  ArrowUpRight,
  ClipboardCheck,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
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
import { collection, onSnapshot, query } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";

export default function OwnerDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'owner') {
      router.push('/login');
    }
    
    const q = query(collection(db, "projects"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
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

    return () => unsubscribe();
  }, [router, toast]);

  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalSpent = projects.reduce((acc, p) => acc + (p.spent || 0), 0);
  const onTrackProjects = projects.filter(p => (p.spent || 0) <= (p.budget || 0)).length;
  const overallProgress = projects.length > 0 ? projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length : 0;
  
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
              <CardTitle>Site Manager's Activity</CardTitle>
              <CardDescription>Recent updates from the site.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" />
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Site Admin</p>
                  <p className="text-sm text-muted-foreground">
                    Logged usage for Downtown Tower - Level 12.
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">1h ago</div>
              </div>
              <div className="flex items-center gap-4">
                 <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" />
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Site Admin</p>
                  <p className="text-sm text-muted-foreground">
                    Received concrete delivery at North Bridge site.
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">3h ago</div>
              </div>
              <div className="flex items-center gap-4">
                 <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" />
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Site Admin</p>
                  <p className="text-sm text-muted-foreground">
                    Updated timeline for Westgate Mall foundation.
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">1d ago</div>
              </div>
               <div className="flex items-center gap-4">
                 <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Avatar" />
                  <AvatarFallback>SA</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Site Admin</p>
                  <p className="text-sm text-muted-foreground">
                    Resolved compliance issue on Suburb Complex.
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">2d ago</div>
              </div>
            </CardContent>
          </Card>
      </div>
    </>
  );
}
