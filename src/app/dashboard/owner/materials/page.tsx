
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
import { useEffect, useState } from "react";
import { db, collection, onSnapshot, doc, deleteDoc, query, orderBy } from "@/lib/firebase";
import { ApproveMaterialRequestDialog } from "@/components/approve-material-request-dialog";

interface Material {
  id: string;
  name: string;
  supplier: string;
  project: string;
  quantity: number;
  unit: string;
  status: 'Delivered' | 'Pending' | 'Delayed';
  lastUpdated: string;
}

export default function OwnerMaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);


  useEffect(() => {
    const q = query(collection(db, "materials"), orderBy("lastUpdated", "desc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const materialsData: Material[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        materialsData.push({ id: doc.id, ...data } as Material);
      });
      setMaterials(materialsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  
  const handleReviewClick = (material: Material) => {
    setSelectedMaterial(material);
    setIsDialogOpen(true);
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
          <h1 className="text-lg font-semibold md:text-2xl">Global Materials Inventory</h1>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>All Materials</CardTitle>
                <CardDescription>A consolidated view of all materials across every project, including pending requests.</CardDescription>
            </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Material</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Stock/Request Qty</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Last Updated
                  </TableHead>
                   <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading inventory...</TableCell></TableRow>
                ) : materials.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.project}</TableCell>
                    <TableCell>{`${item.quantity ?? 0} ${item.unit ?? ''}`.trim()}</TableCell>
                    <TableCell>{item.supplier}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(item.status)}>{item.status}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {formatLastUpdated(item.lastUpdated)}
                    </TableCell>
                    <TableCell>
                      {item.status === 'Pending' ? (
                        <Button variant="outline" size="sm" onClick={() => handleReviewClick(item)}>Review</Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">N/A</span>
                      )}
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
      {selectedMaterial && (
        <ApproveMaterialRequestDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          material={selectedMaterial}
        />
      )}
    </>
  );
}

