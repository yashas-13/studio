import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
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

export default function Dashboard() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 since last month
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
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              +1 since last week
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
        <Card>
          <CardHeader>
            <CardTitle>Recent Site Updates</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8">
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
             <div className="flex items-center gap-4">
              <Avatar className="hidden h-9 w-9 sm:flex">
                <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026704c" alt="Avatar" />
                <AvatarFallback>SN</AvatarFallback>
              </Avatar>
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Sofia Nguyen</p>
                <p className="text-sm text-muted-foreground">
                  Flagged potential defect via drone scan.
                </p>
              </div>
              <div className="ml-auto text-sm text-muted-foreground">1d ago</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
