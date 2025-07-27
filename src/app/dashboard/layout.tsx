
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const role = localStorage.getItem('userRole');
    if (!role) {
      router.push('/login');
    } else {
      setUserRole(role);
      // Basic redirection logic, can be expanded
      if (role === 'owner' && !pathname.startsWith('/dashboard/owner')) {
         if (!pathname.startsWith('/dashboard/file-sharing') && !pathname.startsWith('/dashboard/users') && !pathname.startsWith('/dashboard/crm')) {
            // router.push('/dashboard/owner');
        }
      } else if (role === 'sitemanager' && pathname.startsWith('/dashboard/owner')) {
        router.push('/dashboard');
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
    <div className="flex flex-col min-h-screen w-full">
      <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background pb-20 md:pb-6">
          {children}
        </main>
      
      {isClient && (
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 md:hidden">
            <div className="flex h-16 items-center justify-around">
                {navLinks.map((link) => (
                    <Link
                    key={link.href}
                    href={link.href}
                    className={`flex flex-col items-center gap-1 text-xs ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}
                    >
                        <link.icon className="h-5 w-5" />
                        {link.label}
                    </Link>
                ))}
            </div>
        </nav>
      )}
    </div>
  );
}
