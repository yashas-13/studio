"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { db, collection, addDoc, onSnapshot } from "@/lib/firebase";

interface UsageLog {
  id: string;
  material: string;
  quantity: string;
  area: string;
  date: string;
  user: string;
  notes?: string;
}

export function UsageClient() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [newLog, setNewLog] = useState({
    material: "",
    quantity: "",
    area: "",
    notes: "",
  });

  useEffect(() => {
    const q = collection(db, "usageLogs");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const logsData: UsageLog[] = [];
      querySnapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() } as UsageLog);
      });
      setLogs(logsData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });

    return () => unsubscribe();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setNewLog(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.material || !newLog.quantity || !newLog.area) {
        // Basic validation
        return;
    }

    await addDoc(collection(db, "usageLogs"), {
        ...newLog,
        date: new Date().toISOString().split("T")[0],
        user: "S. Admin" // Placeholder user
    });

    // Reset form
    setNewLog({ material: "", quantity: "", area: "", notes: "" });
  };


  return (
    <div className="grid flex-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage Logs</CardTitle>
            <CardDescription>
              A real-time record of all materials consumed on site.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead className="hidden md:table-cell">Project Area</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Logged By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.material}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.area}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.date}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.user}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Log Material Consumption</CardTitle>
            <CardDescription>
              Fill out the form to track daily usage.
            </CardDescription>
          </CardHeader>
           <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="material-type">Material Type</Label>
                <Select value={newLog.material} onValueChange={(value) => handleInputChange('material', value)}>
                  <SelectTrigger id="material-type" aria-label="Select material">
                    <SelectValue placeholder="Select material" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ready-Mix Concrete">Ready-Mix Concrete</SelectItem>
                    <SelectItem value="Steel Rebar">Steel Rebar</SelectItem>
                    <SelectItem value="Plywood Sheets">Plywood Sheets</SelectItem>
                    <SelectItem value="Electrical Wiring">Electrical Wiring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3">
                <Label htmlFor="quantity">Quantity</Label>
                <Input id="quantity" type="text" placeholder="e.g., 15 m³" value={newLog.quantity} onChange={(e) => handleInputChange('quantity', e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="project-area">Project Area</Label>
                <Input id="project-area" type="text" placeholder="e.g., Level 12, West Wing" value={newLog.area} onChange={(e) => handleInputChange('area', e.target.value)} />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea id="notes" placeholder="Any additional notes..." value={newLog.notes} onChange={(e) => handleInputChange('notes', e.target.value)} />
              </div>
            </div>
          </CardContent>
          <CardContent>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">Submit Usage Log</Button>
          </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
