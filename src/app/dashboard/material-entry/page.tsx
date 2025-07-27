
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

interface MaterialEntry {
  id: string;
  name: string;
  supplier: string;
  project: string;
  quantity: number;
  unit: string;
  timestamp: any;
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

  useEffect(() => {
    // Fetches the last 5 material entries logged by this guard (or any guard for now)
    const q = query(collection(db, "materialEntries"), orderBy("timestamp", "desc"), limit(5));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData: MaterialEntry[] = [];
      querySnapshot.forEach((doc) => {
        entriesData.push({ id: doc.id, ...doc.data() } as MaterialEntry);
      });
      setRecentEntries(entriesData);
    });
    return () => unsubscribe();
  }, []);

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

    // NOTE: In a real app, you would upload files to a service like Firebase Storage
    // and get back URLs. For now, we'll just use placeholder names.
    const invoiceUrl = newMaterial.invoice ? `invoices/${newMaterial.invoice.name}` : undefined;
    const photoUrl = newMaterial.photo ? `photos/${newMaterial.photo.name}` : undefined;

    try {
      // Check if material already exists for the project
      const q = query(collection(db, "materials"), where("name", "==", newMaterial.name), where("project", "==", newMaterial.project));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Material exists, update stock
        const existingDoc = querySnapshot.docs[0];
        const currentQuantity = existingDoc.data().quantity || 0;
        await updateDoc(existingDoc.ref, {
          quantity: currentQuantity + quantity,
          lastUpdated: new Date().toISOString(),
          supplier: newMaterial.supplier, // Update supplier to the latest one
          status: "Delivered",
          invoiceUrl,
          photoUrl,
        });
      } else {
        // New material, add to inventory
        await addDoc(collection(db, "materials"), {
          name: newMaterial.name,
          supplier: newMaterial.supplier,
          project: newMaterial.project,
          quantity: quantity,
          unit: newMaterial.unit,
          status: "Delivered",
          lastUpdated: new Date().toISOString(),
          invoiceUrl,
          photoUrl,
        });
      }
      
      // Add to dedicated material entry log
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

      // Add to global activity feed for owner notification
      const activityDetail = `${quantity} ${newMaterial.unit} of ${newMaterial.name} received for project ${newMaterial.project}.`;
      await addDoc(collection(db, "activityFeed"), {
        type: 'MATERIAL_ENTRY',
        user: 'Entry Guard',
        details: activityDetail,
        timestamp: serverTimestamp()
      });

      toast({ title: "Success", description: `${newMaterial.name} added to inventory.` });
      setNewMaterial({ name: "", supplier: "", project: "", quantity: "", unit: "", invoice: null, photo: null });

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Material</Label>
                        <Input id="name" value={newMaterial.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder="e.g., Ready-Mix Concrete" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="supplier">Supplier</Label>
                        <Input id="supplier" value={newMaterial.supplier} onChange={(e) => handleInputChange('supplier', e.target.value)} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="grid gap-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input id="quantity" type="number" value={newMaterial.quantity} onChange={(e) => handleInputChange('quantity', e.target.value)} placeholder="e.g., 50" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="unit">Unit</Label>
                        <Input id="unit" value={newMaterial.unit} onChange={(e) => handleInputChange('unit', e.target.value)} placeholder="e.g., m³, tons, sheets" />
                    </div>
                </div>
                 <div className="grid gap-2">
                    <Label htmlFor="project">Project Destination</Label>
                    <Input id="project" value={newMaterial.project} onChange={(e) => handleInputChange('project', e.target.value)} placeholder="e.g., Downtown Tower" />
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
