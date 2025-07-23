import Link from "next/link";
import {
  Bell,
  Bot,
  Box,
  CheckCheck,
  ClipboardList,
  FileArchive,
  GanttChartSquare,
  HardHat,
  Home,
  LineChart,
  Package,
  Package2,
  Shield,
  ShoppingCart,
  SlidersHorizontal,
  Users,
  Voicemail,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardHeader } from "@/components/dashboard-header";
import { ConstructWiseLogo } from "@/components/icons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navLinks = [
    { href: "/dashboard", icon: Home, label: "Site Dashboard" },
    { href: "/dashboard/owner", icon: Shield, label: "Owner's Dashboard" },
    { href: "/dashboard/materials", icon: Package, label: "Materials Log", badge: "12" },
    { href: "/dashboard/usage", icon: ShoppingCart, label: "Daily Usage" },
    { href: "/dashboard/timeline", icon: GanttChartSquare, label: "Timeline" },
    { href: "/dashboard/reports", icon: LineChart, label: "Reports" },
    { href: "/dashboard/file-sharing", icon: FileArchive, label: "File Sharing" },
  ];

  const aiTools = [
    { href: "/dashboard/forecasting", icon: Bot, label: "Material Forecasting" },
    { href: "/dashboard/waste-reduction", icon: SlidersHorizontal, label: "Waste Reduction" },
    { href: "/dashboard/voice-reporting", icon: Voicemail, label: "Voice Reporting" },
    { href: "/dashboard/defect-detection", icon: HardHat, label: "Defect Detection" },
    { href: "/dashboard/compliance", icon: CheckCheck, label: "Compliance Checks" },
  ];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold text-primary">
              <ConstructWiseLogo className="h-6 w-6" />
              <span className="">ConstructWise</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                  {link.badge && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
            <div className="px-4 my-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Tools</h3>
            </div>
             <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {aiTools.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Contact support for any questions or issues.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
