
'use client';

import { useEffect, useState } from 'react';
import { db, collection, onSnapshot, query, where } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, DoorOpen, BedDouble, PlusCircle, ChevronsUpDown, Filter, SortAsc, SortDesc } from 'lucide-react';
import { type Project } from '../owner/projects/page';
import { type Tower } from '../owner/projects/[id]/towers/page';
import { type Property } from '@/lib/types';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { AddPropertyDialog } from '@/components/add-property-dialog';

type SortOption = 'price_asc' | 'price_desc' | 'size_asc' | 'size_desc';

export default function InventoryPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [towers, setTowers] = useState<Tower[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedTower, setSelectedTower] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');

  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const propertiesUnsub = onSnapshot(collection(db, 'properties'), (snapshot) => {
      const propsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Property));
      setProperties(propsData);
      setLoading(false);
    });

    const projectsUnsub = onSnapshot(collection(db, 'projects'), (snapshot) => {
      const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(projectsData);
    });
    
    const towersUnsub = onSnapshot(collection(db, 'towers'), (snapshot) => {
      const towersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tower));
      setTowers(towersData);
    });

    return () => {
      propertiesUnsub();
      projectsUnsub();
      towersUnsub();
    };
  }, []);

  useEffect(() => {
    let tempProperties = properties;

    // Filter by project
    if (selectedProject !== 'all') {
      tempProperties = tempProperties.filter(p => p.projectId === selectedProject);
    }
    
    // Filter by tower
    if (selectedTower !== 'all') {
      tempProperties = tempProperties.filter(p => p.towerId === selectedTower);
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      tempProperties = tempProperties.filter(p => p.status === selectedStatus);
    }

    // Sort
    tempProperties.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'size_asc': return a.size - b.size;
        case 'size_desc': return b.size - a.size;
        default: return 0;
      }
    });

    setFilteredProperties(tempProperties);

  }, [selectedProject, selectedTower, selectedStatus, sortBy, properties]);

  const getStatusVariant = (status: Property['status']) => {
    switch (status) {
      case 'Available': return 'secondary';
      case 'Booked': return 'outline';
      case 'Sold': return 'destructive';
      default: return 'default';
    }
  };

  const projectTowers = selectedProject === 'all' ? [] : towers.filter(t => t.projectId === selectedProject);

  const renderSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-40 w-full" />
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
            <Button onClick={() => setIsDialogOpen(true)} size="sm">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Property
            </Button>
          </div>
        </div>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Filter className="h-5 w-5"/> Filters & Sorting</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-4">
                 <Select value={selectedProject} onValueChange={(v) => {setSelectedProject(v); setSelectedTower('all');}}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by project" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Projects</SelectItem>
                        {projects.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select value={selectedTower} onValueChange={setSelectedTower} disabled={selectedProject === 'all'}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by tower" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Towers</SelectItem>
                        {projectTowers.map(t => (
                           <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                 <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="Booked">Booked</SelectItem>
                        <SelectItem value="Sold">Sold</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(v: SortOption) => setSortBy(v)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="price_asc">Price: Low to High</SelectItem>
                       <SelectItem value="price_desc">Price: High to Low</SelectItem>
                       <SelectItem value="size_asc">Size: Small to Large</SelectItem>
                       <SelectItem value="size_desc">Size: Large to Small</SelectItem>
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
        
        {loading ? renderSkeleton() : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProperties.length > 0 ? filteredProperties.map(prop => (
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
                  <CardDescription>{prop.project}{prop.tower ? ` - ${prop.tower}` : ''}</CardDescription>
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
                       <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span className="text-sm font-medium">Floor {prop.floor || 'N/A'}</span>
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
            )) : (
                <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">No properties match your current filters.</p>
                </div>
            )}
          </div>
        )}
      </div>
      <AddPropertyDialog isOpen={isDialogOpen} onOpenChange={setIsDialogOpen} projects={projects} />
    </>
  );
}
