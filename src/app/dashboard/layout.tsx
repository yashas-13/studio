
'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
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
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (!role) {
      router.push('/login');
    } else {
      setUserRole(role);
      // Redirect if user is on the wrong dashboard
      if (role === 'owner' && !pathname.startsWith('/dashboard/owner')) {
        // Allow access to file sharing for owner
        if (!pathname.startsWith('/dashboard/file-sharing')) {
           // router.push('/dashboard/owner');
        }
      } else if (role === 'sitemanager' && pathname.startsWith('/dashboard/owner')) {
        router.push('/dashboard');
      }
    }
  }, [pathname, router]);

  const ownerNavLinks = [
    { href: "/dashboard/owner", icon: Shield, label: "Owner's View" },
    { href: "/dashboard/reports", icon: LineChart, label: "Reports" },
    { href: "/dashboard/timeline", icon: GanttChartSquare, label: "Timeline" },
    { href: "/dashboard/file-sharing", icon: FileArchive, label: "Files" },
  ];

  const siteManagerNavLinks = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/materials", icon: Package, label: "Materials" },
    { href: "/dashboard/usage", icon: ShoppingCart, label: "Usage" },
    { href: "/dashboard/ai-tools", icon: Bot, label: "AI Tools" },
  ];
  
  const aiTools = [
    { href: "/dashboard/forecasting", icon: Bot, label: "Material Forecasting" },
    { href: "/dashboard/waste-reduction", icon: SlidersHorizontal, label: "Waste Reduction" },
    { href: "/dashboard/voice-reporting", icon: Voicemail, label: "Voice Reporting" },
    { href: "/dashboard/defect-detection", icon: HardHat, label: "Defect Detection" },
    { href: "/dashboard/compliance", icon: CheckCheck, label: "Compliance Checks" },
  ];

  const getActiveLinkClasses = (href: string) => {
    return pathname === href ? "text-primary" : "text-muted-foreground";
  };
  
  const navLinks = userRole === 'owner' ? ownerNavLinks : siteManagerNavLinks;

  return (
    <div className="flex flex-col min-h-screen w-full">
      <DashboardHeader />
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background pb-20">
          {children}
        </main>
      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t md:hidden z-50">
        <div className="grid h-16 grid-cols-4 items-center justify-items-center">
            {navLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className={`flex flex-col items-center gap-1 transition-all hover:text-primary ${getActiveLinkClasses(link.href)}`}
                >
                <link.icon className="h-6 w-6" />
                <span className="text-xs">{link.label}</span>
                </Link>
            ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <div className="hidden md:grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] fixed top-0 left-0">
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
              <div className="flex-1 overflow-y-auto">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
                  {userRole === 'owner' ? ownerNavLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${getActiveLinkClasses(link.href)}`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  )) : siteManagerNavLinks.map((link) => (
                     <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${getActiveLinkClasses(link.href)}`}
                    >
                      <link.icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  ))}
                </nav>
                 {userRole === 'sitemanager' && (
                   <>
                    <div className="px-4 my-4">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AI Tools</h3>
                    </div>
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                      {aiTools.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${getActiveLinkClasses(link.href)}`}
                        >
                          <link.icon className="h-4 w-4" />
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                   </>
                 )}
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
            <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 opacity-0">
                // This is a spacer
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
              {children}
            </main>
          </div>
        </div>
    </div>
  );
}
