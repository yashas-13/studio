
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { type Project } from '../page';
import {
  ArrowLeft,
  DollarSign,
  MapPin,
  TrendingUp,
  User,
  ListTodo,
  Construction,
  FileArchive,
  Building,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof id === 'string') {
      const unsub = onSnapshot(doc(db, 'projects', id), (doc) => {
        if (doc.exists()) {
          setProject({ id: doc.id, ...doc.data() } as Project);
        } else {
          // Handle project not found
          router.push('/dashboard/owner/projects');
        }
        setLoading(false);
      });
      return () => unsub();
    }
  }, [id, router]);

  const budget = project?.budget || 0;
  const spent = project?.spent || 0;
  const budgetUtilization = budget > 0 ? (spent / budget) * 100 : 0;

  if (loading) {
    return <ProjectDetailsSkeleton />;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft />
        </Button>
        <h1 className="text-2xl font-semibold">{project.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{budget.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total project budget</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{spent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {budgetUtilization.toFixed(1)}% of budget used
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.progress}%</div>
            <Progress value={project.progress} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Site Manager</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://i.pravatar.cc/40?u=${project.siteEngineer}`} />
                <AvatarFallback>{project.siteEngineer.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="font-semibold">{project.siteEngineer}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Project Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                        <h3 className="font-medium">Description</h3>
                        <p className="text-muted-foreground">{project.description}</p>
                        </div>
                        <Separator />
                        <div>
                        <h3 className="font-medium">Location</h3>
                        <p className="text-muted-foreground flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {project.location}
                        </p>
                        </div>
                         <Separator />
                        <div>
                        <h3 className="font-medium">Status</h3>
                        <p className="text-muted-foreground">{project.status}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <div>
            <Card>
                <CardHeader>
                    <CardTitle>Project Hub</CardTitle>
                    <CardDescription>Quick links to project resources.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button asChild variant="outline" className="w-full justify-start gap-2">
                        <Link href={`/dashboard/owner/projects/${project.id}/towers`}>
                            <Building /> Manage Towers
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start gap-2">
                        <Link href={`/dashboard/owner/projects/${project.id}/tasks`}>
                            <ListTodo /> Task List
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start gap-2">
                        <Link href={`/dashboard/owner/projects/${project.id}/usage`}>
                            <Construction /> Material Usage
                        </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start gap-2">
                        <Link href={`/dashboard/owner/projects/${project.id}/files`}>
                            <FileArchive /> Files & Photos
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}


function ProjectDetailsSkeleton() {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-1/2" />
        </div>
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card><CardHeader><Skeleton className="h-5 w-20 mb-2" /><Skeleton className="h-8 w-32" /></CardHeader></Card>
            <Card><CardHeader><Skeleton className="h-5 w-20 mb-2" /><Skeleton className="h-8 w-32" /></CardHeader></Card>
            <Card><CardHeader><Skeleton className="h-5 w-20 mb-2" /><Skeleton className="h-8 w-32" /></CardHeader></Card>
            <Card><CardHeader><Skeleton className="h-5 w-20 mb-2" /><Skeleton className="h-8 w-32" /></CardHeader></Card>
        </div>
         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader><Skeleton className="h-7 w-48" /></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                         <div className="space-y-2">
                            <Skeleton className="h-5 w-24" />
                            <Skeleton className="h-4 w-1/2" />
                        </div>
                    </CardContent>
                </Card>
            </div>
             <div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-32" />
                        <Skeleton className="h-4 w-48" />
                    </CardHeader>
                     <CardContent className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    )
}
