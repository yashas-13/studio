
"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GanttChartSquare, Milestone, Package } from "lucide-react";

const timelineData = {
  startDate: new Date("2024-07-01"),
  endDate: new Date("2024-09-30"),
  phases: [
    { id: 1, name: "Phase 1: Foundation", start: "2024-07-01", end: "2024-07-20", color: "bg-blue-500" },
    { id: 2, name: "Phase 2: Superstructure", start: "2024-07-21", end: "2024-08-15", color: "bg-green-500" },
    { id: 3, name: "Phase 3: MEP & Interiors", start: "2024-08-16", end: "2024-09-10", color: "bg-yellow-500" },
    { id: 4, name: "Phase 4: Handover", start: "2024-09-11", end: "2024-09-30", color: "bg-purple-500" },
  ],
  milestones: [
    { id: 1, name: "Site Clearance", date: "2024-07-05", icon: Milestone },
    { id: 2, name: "Concrete Delivery", date: "2024-07-10", icon: Package },
    { id: 3, name: "Structure Inspection", date: "2024-08-14", icon: Milestone },
    { id: 4, name: "Final Inspection", date: "2024-09-25", icon: Milestone },
  ],
};

const getDaysDifference = (start: Date, end: Date) => {
  return (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
};

export default function TimelinePage() {
  const totalDays = getDaysDifference(timelineData.startDate, timelineData.endDate);

  const calculatePosition = (dateStr: string) => {
    const date = new Date(dateStr);
    const daysFromStart = getDaysDifference(timelineData.startDate, date);
    return (daysFromStart / totalDays) * 100;
  };

  const calculateWidth = (startStr: string, endStr: string) => {
    const start = new Date(startStr);
    const end = new Date(endStr);
    const duration = getDaysDifference(start, end);
    return (duration / totalDays) * 100;
  };

  const months = [];
  let currentDate = new Date(timelineData.startDate);
  while (currentDate <= timelineData.endDate) {
    months.push(new Date(currentDate));
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Project Timeline</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline">Export Timeline</Button>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Downtown Tower Project</CardTitle>
          <CardDescription>July 2024 - September 2024</CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="relative">
            {/* Months */}
            <div className="relative flex h-8 items-center border-b">
              {months.map((month, index) => (
                <div
                  key={index}
                  className="text-sm font-semibold text-muted-foreground"
                  style={{
                    position: 'absolute',
                    left: `${calculatePosition(month.toISOString().split('T')[0])}%`
                  }}
                >
                  {month.toLocaleString('default', { month: 'long' })}
                </div>
              ))}
            </div>
            
            <Separator className="my-4" />

            {/* Phases */}
            <div className="space-y-4">
              {timelineData.phases.map(phase => (
                <div key={phase.id}>
                  <p className="text-sm font-medium mb-2">{phase.name}</p>
                  <div className="relative h-8 w-full rounded-lg bg-muted">
                    <div
                      className={`${phase.color} absolute h-full rounded-lg`}
                      style={{
                        left: `${calculatePosition(phase.start)}%`,
                        width: `${calculateWidth(phase.start, phase.end)}%`,
                      }}
                      title={`${phase.name}: ${phase.start} to ${phase.end}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />
            
            {/* Milestones */}
            <div className="relative h-8 w-full">
              {timelineData.milestones.map(milestone => (
                 <div
                    key={milestone.id}
                    className="absolute top-0 -translate-x-1/2"
                    style={{ left: `${calculatePosition(milestone.date)}%` }}
                    title={`${milestone.name}: ${milestone.date}`}
                  >
                   <milestone.icon className="h-5 w-5 text-accent" />
                   <p className="text-xs whitespace-nowrap mt-1">{milestone.name}</p>
                 </div>
              ))}
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}
