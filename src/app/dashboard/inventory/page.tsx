
'use client';

import { useEffect, useState } from 'react';
import { db, collection, onSnapshot, query, where } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, DoorOpen, BedDouble, Bath, PlusCircle } from 'lucide-react';
import { type Project } from '../owner/projects/page';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AddPropertyDialog } from '@/components/add-property-dialog';

interface Property {
  id: string;
  unitNumber: string;
  project: string;
  type: string; // e.g., '2BHK', '3BHK'
  size: number; // in sqft
  status: 'Available' | 'Booked' | 'Sold';
  price: number;
  photoUrl?: string;
}

export default function InventoryPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const propertiesUnsub = onSnapshot(collection(db, 'properties'), (snapshot) => {
      const propsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setProperties(propsData);
      setFilteredProperties(propsData);
      setLoading(false);
    });

    const projectsUnsub = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
    });

    return () => {
      propertiesUnsub();
      projectsUnsub();
    };
  }, []);

  useEffect(() => {
    if (selectedProject === 'all') {
      setFilteredProperties(properties);
    } else {
      const selectedProjectData = projects.find(p => p.id === selectedProject);
      if (selectedProjectData) {
        setFilteredProperties(properties.filter(p => p.project === selectedProjectData.name));
      } else {
        setFilteredProperties([]);
      }
    }
  }, [selectedProject, properties, projects]);

  const getStatusVariant = (status: Property['status']) => {
    switch (status) {
      case 'Available': return 'secondary';
      case 'Booked': return 'outline';
      case 'Sold': return 'destructive';
      default: return 'default';
    }
  };

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-1/3 ml-auto" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <div className="flex flex-col gap-6">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">Real-Time Inventory</h1>
          <div className="ml-auto flex items-center gap-2">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by project" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </div>
        </div>
        
        {loading ? renderSkeleton() : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.map(prop => (
              <Card key={prop.id} className="flex flex-col overflow-hidden">
                  <div className="relative">
                      <Image 
                          src={prop.photoUrl || `https://placehold.co/600x400.png`} 
                          alt={`${prop.project} - Unit ${prop.unitNumber}`}
                          width={600}
                          height={400}
                          className="object-cover w-full h-40"
                          data-ai-hint="apartment building exterior"
                      />
                      <Badge variant={getStatusVariant(prop.status)} className="absolute top-2 right-2">{prop.status}</Badge>
                  </div>
                <CardHeader>
                  <CardTitle className="text-xl">Unit {prop.unitNumber}</CardTitle>
                  <CardDescription>{prop.project}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="flex items-center justify-between text-muted-foreground">
                      <div className="flex items-center gap-2">
                          <BedDouble className="h-4 w-4" />
                          <span className="text-sm font-medium">{prop.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <DoorOpen className="h-4 w-4" />
                          <span className="text-sm font-medium">{prop.size} sqft</span>
                      </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">₹{prop.price.toLocaleString('en-IN')}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button disabled={prop.status !== 'Available'} className="w-full">
                      {prop.status === 'Available' ? 'Block Unit' : `Unit ${prop.status}`}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
      <AddPropertyDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} projects={projects} />
    </>
  );
}
