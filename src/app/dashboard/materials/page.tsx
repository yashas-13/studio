
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect, useState } from "react";
import { db, collection, addDoc, onSnapshot, doc, deleteDoc, query, where, getDocs, updateDoc, getDoc } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  name: string;
  supplier: string;
  project: string;
  quantity: number;
  unit: string;
  lastUpdated: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    supplier: "",
    project: "",
    quantity: "",
    unit: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const q = collection(db, "materials");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const materialsData: Material[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Basic data validation
        if (data.name && data.lastUpdated) {
            materialsData.push({ id: doc.id, ...data } as Material);
        }
      });
      setMaterials(materialsData.sort((a, b) => {
          const dateA = a.lastUpdated ? new Date(a.lastUpdated).getTime() : 0;
          const dateB = b.lastUpdated ? new Date(b.lastUpdated).getTime() : 0;
          return dateB - dateA;
      }));
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setNewMaterial(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.supplier || !newMaterial.project || !newMaterial.quantity || !newMaterial.unit) {
      toast({ title: "Error", description: "Please fill all fields.", variant: "destructive" });
      return;
    }

    const quantity = parseFloat(newMaterial.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast({ title: "Error", description: "Please enter a valid quantity.", variant: "destructive" });
      return;
    }

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
        });
        toast({ title: "Success", description: `Updated stock for ${newMaterial.name}.` });
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
        });
        toast({ title: "Success", description: `${newMaterial.name} added to inventory.` });
      }

      setIsDialogOpen(false);
      setNewMaterial({ name: "", supplier: "", project: "", quantity: "", unit: "" });

    } catch (error) {
      console.error("Error adding material: ", error);
      toast({ title: "Error", description: "Could not add or update material.", variant: "destructive" });
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    await deleteDoc(doc(db, "materials", id));
  }
  
  const formatLastUpdated = (dateString: string) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'N/A';
    }
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Materials Inventory</h1>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Add Material
              </span>
            </Button>
          </div>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Last Updated
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {materials.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{`${item.quantity ?? 0} ${item.unit ?? ''}`.trim()}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>{item.project}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatLastUpdated(item.lastUpdated)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleDeleteMaterial(item.id)} className="text-destructive">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{materials.length}</strong> of <strong>{materials.length}</strong> materials
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Material to Inventory</DialogTitle>
            <DialogDescription>
              Fill in the details to add or update material stock.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Material</Label>
              <Input id="name" value={newMaterial.name} onChange={(e) => handleInputChange('name', e.target.value)} className="col-span-3" placeholder="e.g., Ready-Mix Concrete" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input id="quantity" type="number" value={newMaterial.quantity} onChange={(e) => handleInputChange('quantity', e.target.value)} className="col-span-3" placeholder="e.g., 50" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unit" className="text-right">Unit</Label>
              <Input id="unit" value={newMaterial.unit} onChange={(e) => handleInputChange('unit', e.target.value)} className="col-span-3" placeholder="e.g., m³, tons, sheets" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">Supplier</Label>
              <Input id="supplier" value={newMaterial.supplier} onChange={(e) => handleInputChange('supplier', e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project" className="text-right">Project</Label>
              <Input id="project" value={newMaterial.project} onChange={(e) => handleInputChange('project', e.target.value)} className="col-span-3" placeholder="e.g., Downtown Tower" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddMaterial}>Save Material</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
