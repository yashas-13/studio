
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Property } from '@/lib/types';
import {
  ArrowLeft,
  BedDouble,
  Building,
  DollarSign,
  DoorOpen,
  MapPin,
  Ruler,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const sampleImageUrls = [
    'https://placehold.co/800x600.png?text=Living+Room',
    'https://placehold.co/800x600.png?text=Bedroom',
    'https://placehold.co/800x600.png?text=Kitchen',
    'https://placehold.co/800x600.png?text=Bathroom',
];

export default function PropertyDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id === 'string') {
      const unsub = onSnapshot(doc(db, 'properties', id), (doc) => {
        if (doc.exists()) {
          setProperty({ id: doc.id, ...doc.data() } as Property);
        } else {
          router.push('/dashboard/inventory');
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, [id, router]);
  
  const getStatusVariant = (status: Property['status']) => {
    switch (status) {
      case 'Available': return 'secondary';
      case 'Booked': return 'outline';
      case 'Sold': return 'destructive';
      default: return 'default';
    }
  };

  if (loading) {
    return <PropertyDetailsSkeleton />;
  }

  if (!property) {
    return <div>Property not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <div>
            <h1 className="text-2xl font-semibold">Unit {property.unitNumber}</h1>
            <p className="text-muted-foreground">{property.project} - {property.tower}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
            <Card>
                <CardContent className="p-0">
                     <Carousel>
                        <CarouselContent>
                            <CarouselItem>
                                <Image 
                                    src={property.photoUrl || 'https://placehold.co/800x600.png'} 
                                    alt={`Main photo of ${property.unitNumber}`}
                                    width={800} height={600}
                                    className="rounded-t-lg object-cover w-full aspect-video"
                                    data-ai-hint="apartment building exterior"
                                />
                            </CarouselItem>
                             {sampleImageUrls.map((url, i) => (
                                <CarouselItem key={i}>
                                     <Image 
                                        src={url} 
                                        alt={`Photo ${i+1} of ${property.unitNumber}`}
                                        width={800} height={600}
                                        className="rounded-t-lg object-cover w-full aspect-video"
                                        data-ai-hint="apartment interior"
                                    />
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                        <CarouselPrevious className="left-4"/>
                        <CarouselNext className="right-4"/>
                    </Carousel>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-6">
             <Card>
                <CardHeader>
                    <CardTitle>Key Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Status</span>
                        <Badge variant={getStatusVariant(property.status)}>{property.status}</Badge>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-semibold text-lg">₹{property.price.toLocaleString('en-IN')}</span>
                    </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Type</span>
                        <span>{property.type}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Size</span>
                        <span>{property.size} sqft</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Floor</span>
                        <span>{property.floor}</span>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" disabled={property.status !== 'Available'}>
                        {property.status === 'Available' ? 'Block Unit' : `Unit is ${property.status}`}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}


function PropertyDetailsSkeleton() {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <div className="space-y-2">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card>
                    <CardContent className="p-0">
                        <Skeleton className="w-full aspect-video rounded-t-lg" />
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                        <Skeleton className="h-5 w-full" />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><Skeleton className="h-6 w-24" /></CardHeader>
                    <CardContent>
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    )
}
