
"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Download } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { db, collection, onSnapshot, query, where } from "@/lib/firebase";
import { type Project } from "../owner/projects/page";

interface Material {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  project: string;
}

interface UsageLog {
  id: string;
  materialName: string;
  quantity: number;
  project: string;
}

const chartConfig = {
  delivered: {
    label: "Initial Stock",
    color: "hsl(var(--secondary-foreground))",
  },
  used: {
    label: "Used",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function ReportsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [materials, setMaterials] = useState<Material[]>([]);
    const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
    const [selectedProject, setSelectedProject] = useState<string>('all');
    const [chartData, setChartData] = useState<any[]>([]);

    useEffect(() => {
        const projectsUnsub = onSnapshot(collection(db, "projects"), (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
        });
        const materialsUnsub = onSnapshot(collection(db, "materials"), (snapshot) => {
            setMaterials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Material)));
        });
        const usageUnsub = onSnapshot(collection(db, "usageLogs"), (snapshot) => {
            setUsageLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UsageLog)));
        });

        return () => {
            projectsUnsub();
            materialsUnsub();
            usageUnsub();
        }
    }, []);
    
    useEffect(() => {
        let filteredMaterials = materials;
        let filteredUsage = usageLogs;

        if (selectedProject !== 'all') {
            const project = projects.find(p => p.id === selectedProject);
            if (project) {
                 filteredMaterials = materials.filter(m => m.project === project.name);
                 filteredUsage = usageLogs.filter(u => u.project === project.name);
            }
        }
        
        const dataMap = new Map<string, { delivered: number, used: number, unit: string }>();

        // This is a simplified logic. A real app might have initial stock values.
        // For now, delivered = current stock + used amount.
        filteredMaterials.forEach(m => {
            dataMap.set(m.name, { delivered: m.quantity, used: 0, unit: m.unit });
        });

        filteredUsage.forEach(log => {
            const existing = dataMap.get(log.materialName);
            if (existing) {
                existing.used += log.quantity;
                existing.delivered += log.quantity; // Adjust "delivered" to reflect total stock before usage
            }
        });

        const data = Array.from(dataMap.entries()).map(([material, values]) => ({
            material,
            ...values,
            waste: values.delivered > 0 ? (values.used / values.delivered) * 10 : 0 // Simplified waste calc
        }));

        setChartData(data);

    }, [materials, usageLogs, selectedProject, projects]);


  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Reports</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Generate Report</CardTitle>
          <CardDescription>Select criteria to generate a material consumption report.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Project</p>
                <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Select Project" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Date Range</p>
                <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className="w-full md:w-[300px] justify-start text-left font-normal"
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        <span>July 1, 2024 - July 31, 2024</span>
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
            </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Consumption: Initial vs. Used</CardTitle>
            <CardDescription>Based on available data</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData} accessibilityLayer>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="material" tickLine={false} tickMargin={10} axisLine={false} />
                <YAxis />
                <RechartsTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="delivered" fill="var(--color-delivered)" radius={4} />
                <Bar dataKey="used" fill="var(--color-used)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Material Summary</CardTitle>
            <CardDescription>Detailed breakdown of material usage.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead className="text-right">Used</TableHead>
                        <TableHead className="text-right">Waste % (Est.)</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {chartData.length > 0 ? chartData.map(item => (
                    <TableRow key={item.material}>
                        <TableCell>{item.material}</TableCell>
                        <TableCell className="text-right">{item.used} {item.unit}</TableCell>
                        <TableCell className="text-right">{item.waste.toFixed(1)}%</TableCell>
                    </TableRow>
                   )) : (
                    <TableRow>
                        <TableCell colSpan={3} className="text-center h-24">No data available for selected criteria.</TableCell>
                    </TableRow>
                   )}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
