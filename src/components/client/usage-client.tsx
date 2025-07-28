

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { db, collection, addDoc, onSnapshot, doc, updateDoc, getDoc, query, orderBy, serverTimestamp } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { type Project } from "@/app/dashboard/owner/projects/page";

interface UsageLog {
  id: string;
  materialName: string;
  quantity: number;
  unit: string;
  project: string;
  area: string;
  date: string;
  user: string;
  notes?: string;
}

interface Material {
  id: string;
  name: string;
  project: string;
  projectId: string;
  quantity: number;
  unit: string;
}

export function UsageClient() {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [newLog, setNewLog] = useState({
    materialId: "",
    quantity: "",
    area: "",
    notes: "",
    projectId: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const qLogs = query(collection(db, "usageLogs"), orderBy("date", "desc"));
    const unsubscribeLogs = onSnapshot(qLogs, (querySnapshot) => {
      const logsData: UsageLog[] = [];
      querySnapshot.forEach((doc) => {
        logsData.push({ id: doc.id, ...doc.data() } as UsageLog);
      });
      setLogs(logsData);
    });

    const qMaterials = collection(db, "materials");
    const unsubscribeMaterials = onSnapshot(qMaterials, (querySnapshot) => {
      const materialsData: Material[] = [];
      querySnapshot.forEach((doc) => {
        materialsData.push({ id: doc.id, ...doc.data() } as Material);
      });
      setMaterials(materialsData);
      
      if (newLog.projectId) {
          const projectMaterials = materialsData.filter(m => m.projectId === newLog.projectId);
          setFilteredMaterials(projectMaterials);
      }
    });

    const qProjects = collection(db, "projects");
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
        setProjects(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Project)))
    });

    return () => {
      unsubscribeLogs();
      unsubscribeMaterials();
      unsubscribeProjects();
    };
  }, [newLog.projectId]);

  const handleProjectChange = (projectId: string) => {
    setNewLog(prev => ({ ...prev, projectId: projectId, materialId: "" }));
    const projectMaterials = materials.filter(m => m.projectId === projectId);
    setFilteredMaterials(projectMaterials);
  };

  const handleInputChange = (name: string, value: string) => {
    setNewLog(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.materialId || !newLog.quantity || !newLog.area || !newLog.projectId) {
      toast({ title: "Error", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }

    const usedQuantity = parseFloat(newLog.quantity);
    if (isNaN(usedQuantity) || usedQuantity <= 0) {
      toast({ title: "Error", description: "Please enter a valid quantity.", variant: "destructive" });
      return;
    }

    try {
      const materialDocRef = doc(db, "materials", newLog.materialId);
      const materialDocSnap = await getDoc(materialDocRef);
      
      if (!materialDocSnap.exists()) {
        toast({ title: "Error", description: "Selected material not found.", variant: "destructive" });
        return;
      }
      
      const materialData = materialDocSnap.data() as Material;
      const currentStock = materialData.quantity;

      if (currentStock < usedQuantity) {
        toast({ title: "Error", description: `Not enough stock. Only ${currentStock} ${materialData.unit} available.`, variant: "destructive" });
        return;
      }

      await updateDoc(materialDocRef, {
        quantity: currentStock - usedQuantity,
        lastUpdated: new Date().toISOString()
      });

      const selectedProject = projects.find(p => p.id === newLog.projectId);

      const usageLogPayload = {
        materialName: materialData.name,
        quantity: usedQuantity,
        unit: materialData.unit || '',
        project: selectedProject?.name || 'N/A',
        projectId: newLog.projectId,
        area: newLog.area,
        notes: newLog.notes,
        date: new Date().toISOString(),
        user: "S. Manager" 
      }
      await addDoc(collection(db, "usageLogs"), usageLogPayload);
      
      const activityDetail = `${usedQuantity} ${materialData.unit || ''} of ${materialData.name} used at ${selectedProject?.name} (${newLog.area}).`;
      await addDoc(collection(db, "activityFeed"), {
        type: 'MATERIAL_USAGE',
        user: 'Site Manager',
        details: activityDetail,
        timestamp: serverTimestamp()
      });
      
      toast({ title: "Success", description: "Usage logged and inventory updated." });

      setNewLog({ materialId: "", quantity: "", area: "", notes: "", projectId: newLog.projectId });

    } catch (error) {
      console.error("Error logging usage: ", error);
      toast({ title: "Error", description: "Could not log usage.", variant: "destructive" });
    }
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
                  <TableHead>Quantity Used</TableHead>
                  <TableHead className="hidden md:table-cell">Project Area</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Logged By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                        <div className="font-medium">{item.materialName}</div>
                        <div className="text-sm text-muted-foreground">{item.project}</div>
                    </TableCell>
                    <TableCell>{`${item.quantity ?? 0} ${item.unit ?? ''}`.trim()}</TableCell>
                    <TableCell className="hidden md:table-cell">{item.area}</TableCell>
                    <TableCell className="hidden md:table-cell">{new Date(item.date).toLocaleDateString()}</TableCell>
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
              Fill out the form to track daily usage and update inventory.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="grid gap-6">
                 <div className="grid gap-3">
                  <Label htmlFor="project">Project</Label>
                  <Select value={newLog.projectId} onValueChange={handleProjectChange}>
                    <SelectTrigger id="project" aria-label="Select project">
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="material-type">Material Type</Label>
                  <Select value={newLog.materialId} onValueChange={(value) => handleInputChange('materialId', value)} disabled={!newLog.projectId}>
                    <SelectTrigger id="material-type" aria-label="Select material">
                      <SelectValue placeholder="Select from available stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredMaterials.map((material) => (
                        <SelectItem key={material.id} value={material.id}>{material.name} (Stock: {material.quantity} {material.unit})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="quantity">Quantity Used</Label>
                  <Input id="quantity" type="number" placeholder="e.g., 15" value={newLog.quantity} onChange={(e) => handleInputChange('quantity', e.target.value)} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="project-area">Project Area / Work Location</Label>
                  <Input id="project-area" type="text" placeholder="e.g., Level 12, West Wing" value={newLog.area} onChange={(e) => handleInputChange('area', e.target.value)} />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Textarea id="notes" placeholder="Any additional notes..." value={newLog.notes} onChange={(e) => handleInputChange('notes', e.target.value)} />
                </div>
              </div>
            </CardContent>
            <CardContent>
              <Button type="submit" className="w-full">Submit Usage Log</Button>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}
