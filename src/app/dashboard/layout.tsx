
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

import { DashboardHeader } from "@/components/dashboard-header";
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
    }
  }, [pathname, router]);

  const ownerNavLinks = [
    { href: "/dashboard/owner", icon: Shield, label: "Owner's View" },
    { href: "/dashboard/owner/projects", icon: GanttChartSquare, label: "Projects" },
    { href: "/dashboard/users", icon: Users, label: "Users" },
    { href: "/dashboard/file-sharing", icon: FileArchive, label: "Files" },
    { href: "/dashboard/owner/sales", icon: Briefcase, label: "Sales" },
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
    <div className="flex flex-col min-h-screen w-full">
      <DashboardHeader navLinks={navLinks} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background">
          {children}
        </main>
    </div>
  );
}
