import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Download } from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';

const chartData = [
  { material: 'Concrete', used: 4000, delivered: 5500 },
  { material: 'Rebar', used: 3000, delivered: 3200 },
  { material: 'Plywood', used: 2000, delivered: 2500 },
  { material: 'Wiring', used: 2780, delivered: 3000 },
  { material: 'Piping', used: 1890, delivered: 2000 },
];

const chartConfig = {
  delivered: {
    label: "Delivered",
    color: "hsl(var(--secondary-foreground))",
  },
  used: {
    label: "Used",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function ReportsPage() {
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
                <p className="text-sm font-medium">Report Type</p>
                <Select>
                    <SelectTrigger className="w-full md:w-[200px]">
                        <SelectValue placeholder="Consumption Summary" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="consumption">Consumption Summary</SelectItem>
                        <SelectItem value="inventory">Inventory Status</SelectItem>
                        <SelectItem value="waste">Waste Analysis</SelectItem>
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
            <Button className="mt-auto bg-accent text-accent-foreground hover:bg-accent/90">Generate</Button>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Consumption: Delivered vs. Used</CardTitle>
            <CardDescription>July 2024</CardDescription>
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
            <CardDescription>Detailed breakdown of material usage for July 2024.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Material</TableHead>
                        <TableHead className="text-right">Used</TableHead>
                        <TableHead className="text-right">Waste %</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Ready-Mix Concrete</TableCell>
                        <TableCell className="text-right">500 m³</TableCell>
                        <TableCell className="text-right">3.5%</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Steel Rebar</TableCell>
                        <TableCell className="text-right">85 tons</TableCell>
                        <TableCell className="text-right">2.1%</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Plywood Sheets</TableCell>
                        <TableCell className="text-right">1500 sheets</TableCell>
                        <TableCell className="text-right">5.2%</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Electrical Wiring</TableCell>
                        <TableCell className="text-right">45000 ft</TableCell>
                        <TableCell className="text-right">1.8%</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
