

"use client"

import {
  File,
  ListFilter,
  MoreHorizontal,
  PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { db, collection, addDoc, onSnapshot, doc, deleteDoc, query, where, getDocs, updateDoc, getDoc, orderBy, serverTimestamp, limit } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MaterialEntry {
  id: string;
  name: string;
  supplier: string;
  project: string;
  quantity: number;
  unit: string;
  timestamp: any;
}

interface Project {
  id: string;
  name: string;
}

interface Material {
  id: string;
  name: string;
  supplier: string;
  project: string;
  unit: string;
}

export default function MaterialEntryPage() {
  const [recentEntries, setRecentEntries] = useState<MaterialEntry[]>([]);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    supplier: "",
    project: "",
    quantity: "",
    unit: "",
    invoice: null as File | null,
    photo: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<string[]>([]);
  
  const [isCustomMaterial, setIsCustomMaterial] = useState(false);
  const [isCustomSupplier, setIsCustomSupplier] = useState(false);

  useEffect(() => {
    // Fetches the last 5 material entries
    const q = query(collection(db, "materialEntries"), orderBy("timestamp", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData: MaterialEntry[] = [];
      querySnapshot.forEach((doc) => {
        entriesData.push({ id: doc.id, ...doc.data() } as MaterialEntry);
      });
      setRecentEntries(entriesData);
    });
    
    // Fetch all projects and materials for dropdowns
    const unsubProjects = onSnapshot(collection(db, "projects"), (snapshot) => {
        setProjects(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Project)));
    });
    
    const unsubMaterials = onSnapshot(collection(db, "materials"), (snapshot) => {
        setMaterials(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Material)));
    });

    return () => {
        unsubscribe();
        unsubProjects();
        unsubMaterials();
    };
  }, []);
  
  const handleProjectChange = (projectName: string) => {
    setNewMaterial(prev => ({...prev, project: projectName, name: "", supplier: "", unit: ""}));
    
    const projectMaterials = materials.filter(m => m.project === projectName);
    setFilteredMaterials(projectMaterials);
    
    const projectSuppliers = [...new Set(projectMaterials.map(m => m.supplier))];
    setFilteredSuppliers(projectSuppliers);
    
    setIsCustomMaterial(false);
    setIsCustomSupplier(false);
  }
  
  const handleMaterialChange = (materialName: string) => {
    if (materialName === 'other') {
        setIsCustomMaterial(true);
        setNewMaterial(prev => ({ ...prev, name: "", unit: "" }));
    } else {
        setIsCustomMaterial(false);
        const selectedMaterial = filteredMaterials.find(m => m.name === materialName);
        setNewMaterial(prev => ({
            ...prev,
            name: materialName,
            unit: selectedMaterial?.unit || "",
            supplier: selectedMaterial?.supplier || ""
        }));
        
        if (selectedMaterial) {
            setFilteredSuppliers([...new Set(materials.filter(m => m.project === newMaterial.project).map(m => m.supplier))]);
        }
    }
  };

  const handleSupplierChange = (supplierName: string) => {
    if (supplierName === 'other') {
        setIsCustomSupplier(true);
        setNewMaterial(prev => ({ ...prev, supplier: "" }));
    } else {
        setIsCustomSupplier(false);
        setNewMaterial(prev => ({ ...prev, supplier: supplierName }));
    }
  }


  const handleInputChange = (name: string, value: string) => {
    setNewMaterial(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (name: 'invoice' | 'photo', file: File | null) => {
    setNewMaterial(prev => ({...prev, [name]: file}));
  }

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.name || !newMaterial.supplier || !newMaterial.project || !newMaterial.quantity || !newMaterial.unit) {
      toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    const quantity = parseFloat(newMaterial.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: "Error", description: "Please enter a valid quantity.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      // Find the material in the main inventory
      const q = query(collection(db, "materials"), where("name", "==", newMaterial.name), where("project", "==", newMaterial.project));
      const querySnapshot = await getDocs(q);
      
      const payload: any = {
        lastUpdated: new Date().toISOString(),
        supplier: newMaterial.supplier,
        status: "Delivered"
      };

      // In a real app, you would upload files to Firebase Storage and get URLs.
      // For this demo, we are just noting if a file was selected.
      if (newMaterial.invoice) payload.invoiceUrl = `invoices/${newMaterial.invoice.name}`;
      if (newMaterial.photo) payload.photoUrl = `photos/${newMaterial.photo.name}`;
      
      if (!querySnapshot.empty) {
        // Material exists, update its quantity
        const existingDoc = querySnapshot.docs[0];
        const currentQuantity = existingDoc.data().quantity || 0;
        payload.quantity = currentQuantity + quantity;

        await updateDoc(existingDoc.ref, payload);
      } else {
        // New material, create a new document in inventory
        payload.name = newMaterial.name;
        payload.project = newMaterial.project;
        payload.unit = newMaterial.unit;
        payload.quantity = quantity;
        
        await addDoc(collection(db, "materials"), payload);
      }
      
      // Create a log entry for this specific delivery
      const entryLog = {
          name: newMaterial.name,
          supplier: newMaterial.supplier,
          project: newMaterial.project,
          quantity: quantity,
          unit: newMaterial.unit,
          user: 'Entry Guard', // Placeholder user
          timestamp: serverTimestamp()
      }
      await addDoc(collection(db, "materialEntries"), entryLog);

      // Create an activity feed item for the owner's dashboard
      const activityDetail = `${quantity} ${newMaterial.unit} of ${newMaterial.name} received for project ${newMaterial.project}.`;
      await addDoc(collection(db, "activityFeed"), {
        type: 'MATERIAL_ENTRY',
        user: 'Entry Guard',
        details: activityDetail,
        timestamp: serverTimestamp()
      });

      toast({ title: "Success", description: `${newMaterial.name} added to inventory.` });
      setNewMaterial({ name: "", supplier: "", project: "", quantity: "", unit: "", invoice: null, photo: null });
      setIsCustomMaterial(false);
      setIsCustomSupplier(false);

    } catch (error) {
      console.error("Error adding material: ", error);
      toast({ title: "Error", description: "Could not add or update material.", variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const formatTimestamp = (ts: any) => {
    if (!ts) return 'N/A';
    return ts.toDate().toLocaleString();
  };

  const uniqueMaterialNames = [...new Set(filteredMaterials.map(m => m.name))];

  return (
    <div className="grid flex-1 items-start gap-4 lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card>
          <form onSubmit={handleAddMaterial}>
          <CardHeader>
            <CardTitle>Log New Material Delivery</CardTitle>
            <CardDescription>
              Fill in the details to add or update material stock upon delivery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="project">Project Destination</Label>
                    <Select value={newMaterial.project} onValueChange={handleProjectChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                            {projects.map(p => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Material</Label>
                        <Select onValueChange={handleMaterialChange} value={isCustomMaterial ? 'other' : newMaterial.name} disabled={!newMaterial.project}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a material" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueMaterialNames.map(name => <SelectItem key={name} value={name}>{name}</SelectItem>)}
                                <SelectItem value="other">Other (New Material)</SelectItem>
                            </SelectContent>
                        </Select>
                        {isCustomMaterial && <Input className="mt-2" value={newMaterial.name} onChange={e => handleInputChange('name', e.target.value)} placeholder="Enter new material name" />}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="supplier">Supplier</Label>
                         <Select onValueChange={handleSupplierChange} value={isCustomSupplier ? 'other' : newMaterial.supplier} disabled={!newMaterial.project || !newMaterial.name}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a supplier" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredSuppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                <SelectItem value="other">Other (New Supplier)</SelectItem>
                            </SelectContent>
                        </Select>
                        {isCustomSupplier && <Input className="mt-2" value={newMaterial.supplier} onChange={e => handleInputChange('supplier', e.target.value)} placeholder="Enter new supplier name" />}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" value={newMaterial.quantity} onChange={(e) => handleInputChange('quantity', e.target.value)} placeholder="e.g., 50" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input id="unit" value={newMaterial.unit} onChange={(e) => handleInputChange('unit', e.target.value)} placeholder="e.g., m³, tons, sheets" readOnly={!isCustomMaterial} />
                    </div>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="invoice">Invoice (Optional)</Label>
                        <Input id="invoice" type="file" onChange={(e) => handleFileChange('invoice', e.target.files ? e.target.files[0] : null)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="photo">Photo (Optional)</Label>
                        <Input id="photo" type="file" accept="image/*" onChange={(e) => handleFileChange('photo', e.target.files ? e.target.files[0] : null)} />
                    </div>
                </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Submitting..." : "Add to Inventory"}
            </Button>
          </CardFooter>
          </form>
        </Card>
      </div>
      <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
        <Card>
            <CardHeader>
                <CardTitle>Recent Entries</CardTitle>
                <CardDescription>Your last 5 material entries.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Material</TableHead>
                            <TableHead>Quantity</TableHead>
                            <TableHead>Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {recentEntries.map((entry) => (
                        <TableRow key={entry.id}>
                            <TableCell>
                                <div className="font-medium">{entry.name}</div>
                                <div className="text-sm text-muted-foreground">{entry.project}</div>
                            </TableCell>
                            <TableCell>{entry.quantity} {entry.unit}</TableCell>
                            <TableCell>{formatTimestamp(entry.timestamp)}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
