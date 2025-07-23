
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
import { db, collection, addDoc, onSnapshot, doc, deleteDoc } from "@/lib/firebase";

interface Material {
  id: string;
  name: string;
  supplier: string;
  status: 'Delivered' | 'Pending' | 'Delayed';
  project: string;
  date: string;
  quantity: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    name: "",
    supplier: "",
    status: "Pending" as Material['status'],
    project: "",
    date: "",
    quantity: "",
  });

  useEffect(() => {
    const q = collection(db, "materials");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const materialsData: Material[] = [];
      querySnapshot.forEach((doc) => {
        materialsData.push({ id: doc.id, ...doc.data() } as Material);
      });
      setMaterials(materialsData.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setNewMaterial(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: Material['status']) => {
    setNewMaterial(prev => ({...prev, [name]: value}));
  }

  const handleAddMaterial = async () => {
    if (!newMaterial.name || !newMaterial.supplier || !newMaterial.project || !newMaterial.date || !newMaterial.quantity) {
      // Add proper validation/toast message here
      return;
    }
    await addDoc(collection(db, "materials"), newMaterial);
    setIsDialogOpen(false);
    // Reset form
    setNewMaterial({ name: "", supplier: "", status: "Pending", project: "", date: "", quantity: "" });
  };
  
  const handleDeleteMaterial = async (id: string) => {
      await deleteDoc(doc(db, "materials", id));
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Material Logs</h1>
          <div className="ml-auto flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Filter
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem checked>
                  Delivered
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Pending</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Delayed</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button size="sm" variant="outline" className="h-8 gap-1">
              <File className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Export
              </span>
            </Button>
            <Button size="sm" className="h-8 gap-1" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                Log Delivery
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
                  <TableHead>Quantity</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead className="hidden md:table-cell">Project</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Delivery Date
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
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{item.supplier}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant={item.status === 'Delivered' ? 'secondary' : item.status === 'Pending' ? 'outline' : 'destructive'}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.project}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {item.date}
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
                        <DropdownMenuItem>Edit</DropdownMenuItem>
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
              Showing <strong>1-{materials.length}</strong> of <strong>{materials.length}</strong> logs
            </div>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log New Material Delivery</DialogTitle>
            <DialogDescription>
              Fill in the details of the new material delivery.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Material</Label>
              <Input id="name" value={newMaterial.name} onChange={(e) => handleInputChange('name', e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantity" className="text-right">Quantity</Label>
              <Input id="quantity" value={newMaterial.quantity} onChange={(e) => handleInputChange('quantity', e.target.value)} className="col-span-3" placeholder="e.g., 50m³" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="supplier" className="text-right">Supplier</Label>
              <Input id="supplier" value={newMaterial.supplier} onChange={(e) => handleInputChange('supplier', e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select value={newMaterial.status} onValueChange={(value: Material['status']) => handleSelectChange('status', value)}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Delayed">Delayed</SelectItem>
                  </SelectContent>
                </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project" className="text-right">Project</Label>
              <Input id="project" value={newMaterial.project} onChange={(e) => handleInputChange('project', e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right">Delivery Date</Label>
              <Input id="date" type="date" value={newMaterial.date} onChange={(e) => handleInputChange('date', e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleAddMaterial}>Save Delivery</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
