
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
}

const sampleUsers = [
    { name: "Sanjay Sharma", email: "sanjay.sharma@example.com", role: 'sitemanager' },
    { name: "Aditya Verma", email: "aditya.verma@example.com", role: 'owner' },
    { name: "Rajesh Gupta", email: "rajesh.gupta@example.com", role: 'entryguard' },
    { name: "Anjali Sharma", email: "anjali.sharma@example.com", role: 'salesrep' },
    { name: "Rohan Kumar", email: "rohan.kumar@example.com", role: 'salesrep' },
];

const sampleProjects = [
    { name: "Downtown Tower", description: "45-story high-rise commercial building.", location: "Mumbai, MH", siteEngineer: "Sanjay Sharma", entryGuard: "Rajesh Gupta", status: 'In Progress', budget: 50000000, spent: 25000000, progress: 50, createdAt: new Date() },
    { name: "North Bridge", description: "Suspension bridge construction over the river.", location: "Delhi, DL", siteEngineer: "Sanjay Sharma", entryGuard: "Rajesh Gupta", status: 'Planning', budget: 120000000, spent: 5000000, progress: 5, createdAt: new Date() },
    { name: "Suburb Complex", description: "Residential complex with 5 towers.", location: "Bengaluru, KA", siteEngineer: "Sanjay Sharma", entryGuard: "Rajesh Gupta", status: 'Completed', budget: 80000000, spent: 78000000, progress: 100, createdAt: new Date() },
];

const sampleMaterials = [
    { name: "Ready-Mix Concrete", quantity: 50, unit: "m³", supplier: "CEMEX", status: "Delivered", project: "Downtown Tower", lastUpdated: new Date().toISOString() },
    { name: "Steel Rebar", quantity: 10, unit: "tons", supplier: "Gerdau", status: "Pending", project: "North Bridge", lastUpdated: new Date().toISOString() },
    { name: "Plywood Sheets", quantity: 200, unit: "sheets", supplier: "Georgia-Pacific", status: "Delivered", project: "Downtown Tower", lastUpdated: new Date().toISOString() },
    { name: "Electrical Wiring", quantity: 5000, unit: "ft", supplier: "Southwire", status: "Delayed", project: "Suburb Complex", lastUpdated: new Date().toISOString() },
];

const sampleLeads = [
    { name: "Rohan Verma", email: "rohan.verma@email.com", phone: "+919876543210", status: "Warm", assignedTo: "Anjali Sharma", requirements: "3BHK with park view", createdAt: serverTimestamp() },
    { name: "Priya Desai", email: "priya.desai@email.com", phone: "+919123456789", status: "Hot", assignedTo: "Rohan Kumar", requirements: "Looking for a penthouse", createdAt: serverTimestamp() },
    { name: "Amit Patel", email: "amit.patel@email.com", phone: "+919988776655", status: "Hot", assignedTo: "Anjali Sharma", requirements: "Wants to book a 2BHK immediately", createdAt: serverTimestamp() },
    { name: "Sunita Reddy", email: "sunita.reddy@email.com", phone: "+919654321098", status: "Cold", assignedTo: "Rohan Kumar", requirements: "Budget constraints", createdAt: serverTimestamp() }
];

const sampleProperties = [
    // These will be auto-generated now if towers exist
];

const sampleTowers = [
    { name: "Tower A", floors: 15, unitsPerFloor: 8, projectName: "Suburb Complex" },
    { name: "Tower B", floors: 25, unitsPerFloor: 4, projectName: "Suburb Complex" },
    { name: "Commercial Block", floors: 10, unitsPerFloor: 2, projectName: "Downtown Tower" },
];


const sampleFiles = [
    { name: "Architectural-Plans-Rev2.pdf", type: "Document", uploadedBy: "Owner", role: "Owner", date: "2024-07-20", size: "12.5 MB", projectId: "" },
    { name: "Structural-Calculations.xlsx", type: "Spreadsheet", uploadedBy: "Engineer", role: "Engineer", date: "2024-07-21", size: "2.1 MB", projectId: "" },
    { name: "Site-Photo-2024-07-22.jpg", type: "Image", uploadedBy: "Site Admin", role: "Admin", date: "2024-07-22", size: "4.8 MB", projectId: "" },
];

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

  const seedDatabase = async () => {
    try {
        let seededCount = 0;
        
        for (const user of sampleUsers) {
            const q = query(collection(db, "users"), where("email", "==", user.email));
            const snap = await getDocs(q);
            if (snap.empty) {
                await addDoc(collection(db, "users"), user);
                seededCount++;
            }
        }
        
        const projectDocs = await getDocs(collection(db, "projects"));
        if (projectDocs.empty) {
            for (const project of sampleProjects) {
                await addDoc(collection(db, "projects"), project);
                seededCount++;
            }
        }
        const projectNameToId: {[key: string]: string} = {};
        const projectSnapshot = await getDocs(collection(db, "projects"));
        projectSnapshot.forEach(doc => {
            projectNameToId[doc.data().name] = doc.id;
        })

        for (const material of sampleMaterials) {
            const q = query(collection(db, "materials"), where("name", "==", material.name), where("project", "==", material.project));
            const snap = await getDocs(q);
            if (snap.empty) {
                await addDoc(collection(db, "materials"), material);
                seededCount++;
            }
        }
      
        for (const file of sampleFiles) {
            const q = query(collection(db, "files"), where("name", "==", file.name));
            const snap = await getDocs(q);
            if (snap.empty) {
                const projectIds = Object.values(projectNameToId);
                const randomProjectId = projectIds[Math.floor(Math.random() * projectIds.length)];
                await addDoc(collection(db, "files"), {...file, projectId: randomProjectId});
                seededCount++;
            }
        }
        
        const leadDocs = await getDocs(collection(db, "leads"));
        if(leadDocs.empty) {
            for (const lead of sampleLeads) {
                const q = query(collection(db, "leads"), where("email", "==", lead.email));
                const snap = await getDocs(q);
                if (snap.empty) {
                    await addDoc(collection(db, "leads"), lead);
                    seededCount++;
                }
            }
        }


        const towerDocs = await getDocs(collection(db, "towers"));
        if (towerDocs.empty) {
            for (const towerData of sampleTowers) {
                const projectId = projectNameToId[towerData.projectName];
                if (projectId) {
                    const towerPayload = {
                        name: towerData.name,
                        floors: towerData.floors,
                        unitsPerFloor: towerData.unitsPerFloor,
                        projectId: projectId,
                    };
                    const towerRef = await addDoc(collection(db, "towers"), towerPayload);
                    seededCount++;

                    // Auto-generate units for the new tower
                    for (let f = 1; f <= towerData.floors; f++) {
                        for (let u = 1; u <= towerData.unitsPerFloor; u++) {
                            const unitNumber = `${towerData.name.charAt(0)}-${f}${u.toString().padStart(2, '0')}`;
                            const newProperty = {
                                unitNumber: unitNumber,
                                project: towerData.projectName,
                                projectId: projectId,
                                tower: towerData.name,
                                towerId: towerRef.id,
                                floor: f,
                                type: '2BHK',
                                size: 1200,
                                price: 7500000,
                                status: 'Available',
                                photoUrl: null,
                            };
                            await addDoc(collection(db, 'properties'), newProperty);
                            seededCount++;
                        }
                    }
                }
            }
        }

        if (seededCount > 0) {
            toast({
                title: "Success",
                description: `Added ${seededCount} new sample documents.`,
            });
        } else {
             toast({
                title: "Database is up to date",
                description: "All sample data already exists.",
            });
        }

    } catch (error) {
        console.error("Error seeding database:", error);
        toast({
            title: "Error",
            description: "Could not seed the database.",
            variant: "destructive",
        })
    }
  };
  
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
        <h1 className="text-lg font-semibold md:text-2xl">Dashboard</h1>
        <div className="ml-auto">
            <Button onClick={seedDatabase}>
                <Database className="mr-2 h-4 w-4" />
                Seed Sample Data
            </Button>
        </div>
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
