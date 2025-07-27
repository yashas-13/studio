
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { collection, doc, getDoc, onSnapshot, query, where, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { type Project } from "../../page";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Building, PlusCircle, Layers, ChevronsUpDown, MoreHorizontal } from "lucide-react";
import { AddTowerDialog } from "@/components/add-tower-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface Tower {
    id: string;
    projectId: string;
    name: string;
    floors: number;
    unitsPerFloor: number;
}

export default function ProjectTowersPage() {
    const params = useParams();
    const { id } = params;
    const [project, setProject] = useState<Project | null>(null);
    const [towers, setTowers] = useState<Tower[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingTower, setEditingTower] = useState<Tower | null>(null);

    useEffect(() => {
        if (typeof id === 'string') {
            const fetchProject = async () => {
                const docRef = doc(db, 'projects', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setProject({ id: docSnap.id, ...docSnap.data() } as Project);
                }
            }
            fetchProject();
            
            const q = query(collection(db, "towers"), where("projectId", "==", id));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const towersData: Tower[] = [];
                querySnapshot.forEach((doc) => {
                    towersData.push({ id: doc.id, ...doc.data() } as Tower);
                });
                setTowers(towersData);
                setLoading(false);
            });
            return () => unsubscribe();
        }
    }, [id]);
    
    const handleAddClick = () => {
        setEditingTower(null);
        setIsDialogOpen(true);
    }
    
    const handleEditClick = (tower: Tower) => {
        setEditingTower(tower);
        setIsDialogOpen(true);
    }
    
    const handleDeleteClick = async (towerId: string) => {
        if (window.confirm("Are you sure you want to delete this tower? This action cannot be undone.")) {
            await deleteDoc(doc(db, "towers", towerId));
        }
    }


    const renderSkeleton = () => (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );

    return (
        <>
        <div className="flex flex-col gap-4">
            <div className="flex items-center">
                <h1 className="text-lg font-semibold md:text-2xl">
                    Manage Towers: {project?.name || 'Project'}
                </h1>
                <div className="ml-auto">
                    <Button onClick={handleAddClick}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Tower
                    </Button>
                </div>
            </div>
             <Card>
                <CardHeader>
                    <CardTitle>Project Towers</CardTitle>
                    <CardDescription>
                        All towers associated with this project.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                     {loading ? renderSkeleton() : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {towers.length > 0 ? towers.map(tower => (
                            <Card key={tower.id}>
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Building className="h-5 w-5" />
                                            {tower.name}
                                        </div>
                                         <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleEditClick(tower)}>Edit</DropdownMenuItem>
                                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(tower.id)}>Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Layers className="h-4 w-4" />
                                        <span>{tower.floors} Floors</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <ChevronsUpDown className="h-4 w-4" />
                                        <span>{tower.unitsPerFloor} Units / Floor</span>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <p className="text-xs font-bold text-foreground">Total Units: {tower.floors * tower.unitsPerFloor}</p>
                                </CardFooter>
                            </Card>
                        )) : (
                            <p className="text-muted-foreground text-center col-span-full">No towers found for this project yet.</p>
                        )}
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
        <AddTowerDialog 
            isOpen={isDialogOpen} 
            onOpenChange={setIsDialogOpen} 
            projectId={id as string} 
            towerToEdit={editingTower}
        />
        </>
    );
}
