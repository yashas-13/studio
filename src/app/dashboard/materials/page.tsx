
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
import { useEffect, useState } from "react";
import { db, collection, onSnapshot, doc, deleteDoc, query, orderBy } from "@/lib/firebase";

interface Material {
  id: string;
  name: string;
  supplier: string;
  project: string;
  quantity: number;
  unit: string;
  status: 'Delivered' | 'Pending' | 'Delayed';
  lastUpdated: string;
  invoiceUrl?: string;
  photoUrl?: string;
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    const q = query(collection(db, "materials"), orderBy("lastUpdated", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const materialsData: Material[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Basic data validation
        if (data.name && data.lastUpdated) {
            materialsData.push({ id: doc.id, ...data } as Material);
        }
      });
      setMaterials(materialsData);
    });
    return () => unsubscribe();
  }, []);

  const handleDeleteMaterial = async (id: string) => {
    await deleteDoc(doc(db, "materials", id));
  }
  
  const formatLastUpdated = (dateString: string) => {
    if (!dateString || isNaN(new Date(dateString).getTime())) {
      return 'N/A';
    }
    return new Date(dateString).toLocaleString();
  };

  const getStatusVariant = (status: string): "secondary" | "outline" | "destructive" | "default" => {
    switch (status) {
      case "Delivered":
        return "secondary";
      case "Pending":
        return "outline";
      case "Delayed":
        return "destructive";
      default:
        return "default";
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Materials Inventory</h1>
          <div className="ml-auto flex items-center gap-2">
             <p className="text-sm text-muted-foreground">This is a view-only inventory. Add materials via the Daily Usage Log page.</p>
          </div>
        </div>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Status</TableHead>
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
                    <TableCell>
                      <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </TableCell>
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
    </>
  );
}
