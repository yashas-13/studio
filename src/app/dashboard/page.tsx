
'use client'

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ClipboardCheck,
  CreditCard,
  Database,
  GanttChartSquare,
  Package,
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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { db, collection, addDoc, onSnapshot, getDocs, query, orderBy, limit, where, serverTimestamp } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  name: string;
  supplier: string;
  status: 'Delivered' | 'Pending' | 'Delayed';
  project: string;
  quantity: number;
  unit: string;
  lastUpdated: string;
}

interface UsageLog {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  project: string;
  area: string;
  date: string;
  user: string;
  notes?: string;
}

interface Project {
  id: string;
  name: string;
  status: 'Planning' | 'In Progress' | 'Completed';
}

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [recentDeliveries, setRecentDeliveries] = useState<Material[]>([]);
  const [recentUsage, setRecentUsage] = useState<UsageLog[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [overdueTasksCount, setOverdueTasksCount] = useState(0);
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);


  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'sitemanager') {
      router.push('/login');
    }

    const qMaterials = query(collection(db, "materials"), orderBy("lastUpdated", "desc"), limit(4));
    const unsubscribeMaterials = onSnapshot(qMaterials, (querySnapshot) => {
        const materialsData: Material[] = [];
        querySnapshot.forEach((doc) => {
            materialsData.push({ id: doc.id, ...doc.data() } as Material);
        });
        setRecentDeliveries(materialsData);
    });

    const qUsage = query(collection(db, "usageLogs"), orderBy("date", "desc"), limit(2));
    const unsubscribeUsage = onSnapshot(qUsage, (snapshot) => {
      const usageData: UsageLog[] = [];
      snapshot.forEach(doc => usageData.push({ id: doc.id, ...doc.data() } as UsageLog));
      setRecentUsage(usageData);
    });
    
    const qAllMaterials = collection(db, "materials");
    const unsubscribeAllMaterials = onSnapshot(qAllMaterials, (snapshot) => {
        const lowStock = snapshot.docs.filter(doc => (doc.data().quantity || 0) < 10).length;
        setLowStockCount(lowStock);
    });

    const qProjects = query(collection(db, "projects"));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
        setProjectCount(snapshot.size);
        const active = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)).filter(p => p.status === 'In Progress');
        setActiveProjects(active);
    });
    
    const qTasks = query(collection(db, 'tasks'), where('status', '!=', 'Done'));
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
        const now = new Date();
        const overdue = snapshot.docs.filter(doc => {
            const dueDate = new Date(doc.data().dueDate);
            return dueDate < now;
        }).length;
        setOverdueTasksCount(overdue);
    });


    return () => {
        unsubscribeMaterials();
        unsubscribeUsage();
        unsubscribeAllMaterials();
        unsubscribeProjects();
        unsubscribeTasks();
    };
  }, [router]);
  
  const formatLastUpdated = (dateString: string) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'N/A';
    }
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diff / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <div className="flex items-center mb-4">
        <h1 className="text-lg font-semibold md:text-2xl">Site Manager Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <GanttChartSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all sites
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Materials Low
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              Items with less than 10 units
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overdueTasksCount}</div>
            <p className="text-xs text-muted-foreground">
              Across all projects
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">
              All sites operational
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Recent Deliveries</CardTitle>
              <CardDescription>
                Recent material deliveries to your sites.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/dashboard/materials">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead className="hidden xl:table-column">
                    Supplier
                  </TableHead>
                  <TableHead className="hidden xl:table-column">
                    Status
                  </TableHead>
                  <TableHead className="hidden md:table-cell">
                    Delivery Date
                  </TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDeliveries.length === 0 ? (
                   <TableRow>
                        <TableCell colSpan={5} className="text-center h-24">
                            No recent deliveries. Try seeding some data.
                        </TableCell>
                    </TableRow>
                ) : (
                    recentDeliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                        <TableCell>
                            <div className="font-medium">{delivery.name}</div>
                            <div className="hidden text-sm text-muted-foreground md:inline">
                                {delivery.project}
                            </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-column">
                           {delivery.supplier}
                        </TableCell>
                        <TableCell className="hidden xl:table-column">
                            <Badge variant={delivery.status === 'Delivered' ? 'secondary' : delivery.status === 'Pending' ? 'outline' : 'destructive'}>{delivery.status}</Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                           {new Date(delivery.lastUpdated).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">{`${delivery.quantity} ${delivery.unit}`}
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
              <CardTitle>Recent Site Updates</CardTitle>
              <CardDescription>Real-time updates from site managers.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {recentUsage.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No recent usage logs.</p>
              ) : (
                recentUsage.map((log) => (
                  <div key={log.id} className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarImage src={`https://i.pravatar.cc/150?u=${log.user}`} alt="Avatar" />
                      <AvatarFallback>{log.user.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">{log.user}</p>
                      <p className="text-sm text-muted-foreground">
                        Logged usage of {log.materialName} at {log.project}.
                      </p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">{formatLastUpdated(log.date)}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
      </div>
    </>
  );
}
