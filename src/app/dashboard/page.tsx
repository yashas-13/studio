
'use client'

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  ClipboardCheck,
  CreditCard,
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
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (role !== 'sitemanager') {
      router.push('/login');
    }
  }, [router]);

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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-3.333 0-5 2.667-5 4s1.667 4 5 4 5-2.667 5-4-1.667-4-5-4zm0 5.333a1.333 1.333 0 110-2.666 1.333 1.333 0 010 2.666z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 6h8M8 18h8"
              />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              -1 since last month
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
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              +1 from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 critical priority
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sites</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
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
                <TableRow>
                  <TableCell>
                    <div className="font-medium">Ready-Mix Concrete</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      CEMEX
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    Supplier A
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    <Badge className="text-xs" variant="outline">
                      Delivered
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    2024-07-25
                  </TableCell>
                  <TableCell className="text-right">50 m³</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">Steel Rebar</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      Gerdau
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    Supplier B
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    <Badge className="text-xs" variant="outline">
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    2024-07-28
                  </TableCell>
                  <TableCell className="text-right">10 tons</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">Plywood Sheets</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      Georgia-Pacific
                    </div>
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    Supplier C
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    <Badge className="text-xs" variant="outline">
                      Delivered
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    2024-07-24
                  </TableCell>
                  <TableCell className="text-right">200 sheets</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <div className="font-medium">Electrical Wiring</div>
                    <div className="hidden text-sm text-muted-foreground md:inline">
                      Southwire
                    </div>
                  </TableCell>
                   <TableCell className="hidden xl:table-column">
                    Supplier D
                  </TableCell>
                  <TableCell className="hidden xl:table-column">
                    <Badge className="text-xs" variant="outline">
                      Delayed
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    2024-07-26
                  </TableCell>
                  <TableCell className="text-right">5000 ft</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Site Briefing</CardTitle>
              <CardDescription>Key tasks and notes for today.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-2 text-primary">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Critical Tasks</p>
                  <p className="text-sm text-muted-foreground">
                    Concrete pour for Level 15 slab. Pre-pour inspection at 9 AM.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-destructive/10 p-2 text-destructive">
                 <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Safety Focus</p>
                  <p className="text-sm text-muted-foreground">
                    High-wind advisory. Secure all loose materials. Full PPE required on all levels.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Site Updates</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704a" alt="Avatar" />
                  <AvatarFallback>OM</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Olivia Martin</p>
                  <p className="text-sm text-muted-foreground">
                    Logged usage for Downtown Tower - Level 12.
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">1h ago</div>
              </div>
              <div className="flex items-center gap-4">
                <Avatar className="hidden h-9 w-9 sm:flex">
                  <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704b" alt="Avatar" />
                  <AvatarFallback>JL</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">Jackson Lee</p>
                  <p className="text-sm text-muted-foreground">
                    Received concrete delivery at North Bridge site.
                  </p>
                </div>
                <div className="ml-auto text-sm text-muted-foreground">3h ago</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
