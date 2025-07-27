
'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Bot,
  Box,
  Briefcase,
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
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

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
        // Allow access to file sharing and CRM for owner
        if (!pathname.startsWith('/dashboard/file-sharing') && !pathname.startsWith('/dashboard/users') && !pathname.startsWith('/dashboard/crm')) {
           // router.push('/dashboard/owner');
        }
      } else if (role === 'sitemanager' && (pathname.startsWith('/dashboard/owner') || pathname.startsWith('/dashboard/crm'))) {
        router.push('/dashboard');
      } else if (role === 'entryguard' && !pathname.startsWith('/dashboard/materials')) {
        if (pathname !== '/dashboard') router.push('/dashboard/materials');
      } else if (role === 'salesrep' && !pathname.startsWith('/dashboard/crm')) {
        router.push('/dashboard/crm');
      }
    }
  }, [pathname, router]);

  const ownerNavLinks = [
    { href: "/dashboard/owner", icon: Shield, label: "Owner's View" },
    { href: "/dashboard/owner/projects", icon: GanttChartSquare, label: "Projects" },
    { href: "/dashboard/users", icon: Users, label: "Users" },
    { href: "/dashboard/file-sharing", icon: FileArchive, label: "Files" },
    { href: "/dashboard/owner/sales", icon: Briefcase, label: "CRM" },
  ];

  const siteManagerNavLinks = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/materials", icon: Package, label: "Materials" },
    { href: "/dashboard/usage", icon: ShoppingCart, label: "Usage" },
    { href: "/dashboard/ai-tools", icon: Bot, label: "AI Tools" },
  ];
  
  const entryGuardNavLinks = [
      { href: "/dashboard/materials", icon: Package, label: "Inventory"},
  ];

  const salesRepNavLinks = [
      { href: "/dashboard/crm", icon: Briefcase, label: "CRM"},
  ];
  
  const getNavLinks = () => {
      switch(userRole) {
          case 'owner': return ownerNavLinks;
          case 'sitemanager': return siteManagerNavLinks;
          case 'entryguard': return entryGuardNavLinks;
          case 'salesrep': return salesRepNavLinks;
          default: return [];
      }
  }
  
  const navLinks = getNavLinks();

  return (
    <SidebarProvider>
        <div className="flex flex-col min-h-screen w-full">
            <DashboardHeader />
            <div className="flex flex-1">
                <div className="hidden md:block">
                    <Sidebar>
                        <SidebarContent>
                        <SidebarMenu>
                            {navLinks.map((link) => (
                            <SidebarMenuItem key={link.href}>
                                <Link href={link.href}>
                                <SidebarMenuButton
                                    isActive={pathname === link.href}
                                >
                                    <link.icon />
                                    {link.label}
                                </SidebarMenuButton>
                                </Link>
                            </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                        </SidebarContent>
                    </Sidebar>
                </div>
                <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background">
                    {children}
                </main>
            </div>
        </div>
    </SidebarProvider>
  );
}
