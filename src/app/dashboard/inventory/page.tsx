
'use client';

import { useEffect, useState } from 'react';
import { db, collection, onSnapshot, query, where } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, DoorOpen, BedDouble, Bath } from 'lucide-react';
import { type Project } from '../owner/projects/page';

interface Property {
  id: string;
  unitNumber: string;
  project: string;
  type: string; // e.g., '2BHK', '3BHK'
  size: number; // in sqft
  status: 'Available' | 'Booked' | 'Sold';
  price: number;
}

export default function InventoryPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [loading, setLoading] = useState(true);

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
      const selectedProjectName = projects.find(p => p.id === selectedProject)?.name;
      if (selectedProjectName) {
        setFilteredProperties(properties.filter(p => p.project === selectedProjectName));
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl">Real-Time Inventory</h1>
        <div className="ml-auto">
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
        </div>
      </div>
      
      {loading ? renderSkeleton() : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProperties.map(prop => (
            <Card key={prop.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="text-xl">Unit {prop.unitNumber}</CardTitle>
                        <CardDescription>{prop.project}</CardDescription>
                    </div>
                    <Badge variant={getStatusVariant(prop.status)}>{prop.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <BedDouble className="h-4 w-4" />
                        <span className="text-sm">{prop.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <DoorOpen className="h-4 w-4" />
                        <span className="text-sm">{prop.size} sqft</span>
                    </div>
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{prop.price.toLocaleString('en-IN')}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
