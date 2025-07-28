
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
  Menu,
  Building,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"

import { DashboardHeader } from "@/components/dashboard-header";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ConstructWiseLogo } from "@/components/icons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false)
 
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    if (!role) {
      router.push('/login');
    } else {
      setUserRole(role);
    }
  }, [pathname, router]);

  const ownerNavLinks = [
    { href: "/dashboard/owner", icon: Shield, label: "Owner's View" },
    { href: "/dashboard/owner/projects", icon: GanttChartSquare, label: "Projects" },
    { href: "/dashboard/owner/materials", icon: Package, label: "Materials" },
    { href: "/dashboard/users", icon: Users, label: "Users" },
    { href: "/dashboard/owner/sales", icon: Briefcase, label: "Sales" },
    { href: "/dashboard/file-sharing", icon: FileArchive, label: "File Sharing" },
  ];

  const siteManagerNavLinks = [
    { href: "/dashboard", icon: Home, label: "Dashboard" },
    { href: "/dashboard/materials", icon: Package, label: "Materials" },
    { href: "/dashboard/reports", icon: LineChart, label: "Reports" },
    { href: "/dashboard/timeline", icon: GanttChartSquare, label: "Timeline" },
    { href: "/dashboard/usage", icon: ShoppingCart, label: "Usage" },
    { href: "/dashboard/ai-tools", icon: Bot, label: "AI Tools" },
  ];
  
  const entryGuardNavLinks = [
      { href: "/dashboard/material-entry", icon: Package, label: "Material Entry"},
  ];

  const salesRepNavLinks = [
      { href: "/dashboard/sales", icon: Briefcase, label: "Sales Dashboard"},
      { href: "/dashboard/crm", icon: Users, label: "CRM / Leads"},
      { href: "/dashboard/inventory", icon: Building, label: "Inventory"},
  ];
  
  const getNavLinks = () => {
      if (!userRole) return [];
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
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader navLinks={navLinks} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          {children}
        </main>
    </div>
  );
}
