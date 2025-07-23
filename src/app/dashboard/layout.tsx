
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
        if (!pathname.startsWith('/dashboard/file-sharing') && !pathname.startsWith('/dashboard/users')) {
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
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-background pb-20">
          {children}
        </main>
      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50">
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
    </div>
  );
}
