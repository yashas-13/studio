
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConstructWiseLogo } from './icons';
import { db, collection, onSnapshot, addDoc, getDocs, where, query, serverTimestamp } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Database } from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: string;
}

const sampleUsers = [
    { name: "Sanjay Sharma", email: "sanjay.sharma@example.com", role: 'sitemanager' },
    { name: "Aditya Verma", email: "aditya.verma@example.com", role: 'owner' },
    { name: "Rajesh Gupta", email: "rajesh.gupta@example.com", role: 'entryguard' },
    { name: "Anjali Sharma", email: "anjali.sharma@example.com", role: 'salesrep' },
    { name: "Rohan Kumar", email: "rohan.kumar@example.com", role: 'salesrep' },
];

const sampleProjects = [
    { name: "Downtown Tower", description: "45-story high-rise commercial building.", location: "Mumbai, MH", siteEngineer: "Sanjay Sharma", entryGuard: "Rajesh Gupta", status: 'In Progress', budget: 50000000, spent: 25000000, progress: 50, createdAt: new Date() },
    { name: "North Bridge", description: "Suspension bridge construction over the river.", location: "Delhi, DL", siteEngineer: "Sanjay Sharma", entryGuard: "Rajesh Gupta", status: 'Planning', budget: 120000000, spent: 5000000, progress: 5, createdAt: new Date() },
    { name: "Suburb Complex", description: "Residential complex with 5 towers.", location: "Bengaluru, KA", siteEngineer: "Sanjay Sharma", entryGuard: "Rajesh Gupta", status: 'Completed', budget: 80000000, spent: 78000000, progress: 100, createdAt: new Date() },
];

const sampleMaterials = [
    { name: "Ready-Mix Concrete", quantity: 50, unit: "m³", supplier: "CEMEX", status: "Delivered", project: "Downtown Tower", lastUpdated: new Date().toISOString() },
    { name: "Steel Rebar", quantity: 10, unit: "tons", supplier: "Gerdau", status: "Pending", project: "North Bridge", lastUpdated: new Date().toISOString() },
    { name: "Plywood Sheets", quantity: 200, unit: "sheets", supplier: "Georgia-Pacific", status: "Delivered", project: "Downtown Tower", lastUpdated: new Date().toISOString() },
    { name: "Electrical Wiring", quantity: 5000, unit: "ft", supplier: "Southwire", status: "Delayed", project: "Suburb Complex", lastUpdated: new Date().toISOString() },
];

const sampleLeads = [
    { name: "Rohan Verma", email: "rohan.verma@email.com", phone: "+919876543210", status: "Warm", assignedTo: "Anjali Sharma", requirements: "3BHK with park view", createdAt: serverTimestamp() },
    { name: "Priya Desai", email: "priya.desai@email.com", phone: "+919123456789", status: "Hot", assignedTo: "Rohan Kumar", requirements: "Looking for a penthouse", createdAt: serverTimestamp() },
    { name: "Amit Patel", email: "amit.patel@email.com", phone: "+919988776655", status: "Hot", assignedTo: "Anjali Sharma", requirements: "Wants to book a 2BHK immediately", createdAt: serverTimestamp() },
    { name: "Sunita Reddy", email: "sunita.reddy@email.com", phone: "+919654321098", status: "Cold", assignedTo: "Rohan Kumar", requirements: "Budget constraints", createdAt: serverTimestamp() }
];

const sampleTowers = [
    { name: "Tower A", floors: 15, unitsPerFloor: 8, projectName: "Suburb Complex" },
    { name: "Tower B", floors: 25, unitsPerFloor: 4, projectName: "Suburb Complex" },
    { name: "Commercial Block", floors: 10, unitsPerFloor: 2, projectName: "Downtown Tower" },
];

export function LoginForm() {
  const [role, setRole] = useState('');
  const [userId, setUserId] = useState('');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const q = collection(db, "users");
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData: User[] = [];
      querySnapshot.forEach((doc) => {
        usersData.push({ id: doc.id, ...doc.data() } as User);
      });
      setAllUsers(usersData);
    });

    return () => unsubscribe();
  }, []);

  const handleRoleChange = (selectedRole: string) => {
    setRole(selectedRole);
    setUserId(''); // Reset user selection
    const usersForRole = allUsers.filter(user => user.role === selectedRole);
    setFilteredUsers(usersForRole);

    // If there's only one user for the selected role, auto-select them.
    if (usersForRole.length === 1) {
        setUserId(usersForRole[0].id);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !userId) {
        toast({ title: "Error", description: "Please select both a role and a user.", variant: "destructive"});
        return;
    };

    const selectedUser = allUsers.find(u => u.id === userId);
    if (selectedUser) {
        localStorage.setItem('userRole', role);
        localStorage.setItem('userName', selectedUser.name);
    } else {
        toast({ title: "Error", description: "Selected user not found.", variant: "destructive"});
        return;
    }
    
    if (role === 'owner') {
      router.push('/dashboard/owner');
    } else if (role === 'sitemanager') {
      router.push('/dashboard');
    } else if (role === 'entryguard') {
      router.push('/dashboard/material-entry');
    } else if (role === 'salesrep') {
      router.push('/dashboard/sales');
    }
  };
  
  const seedDatabase = async () => {
    try {
        let seededCount = 0;
        
        for (const user of sampleUsers) {
            const q = query(collection(db, "users"), where("email", "==", user.email));
            const snap = await getDocs(q);
            if (snap.empty) {
                await addDoc(collection(db, "users"), user);
                seededCount++;
            }
        }
        
        const projectNameToId: {[key: string]: string} = {};
        const projectDocsCheck = await getDocs(collection(db, "projects"));
        if (projectDocsCheck.empty) {
            for (const project of sampleProjects) {
               const docRef = await addDoc(collection(db, "projects"), project);
               projectNameToId[project.name] = docRef.id;
               seededCount++;
            }
        } else {
             projectDocsCheck.forEach(doc => {
                projectNameToId[doc.data().name] = doc.id;
            })
        }

        for (const material of sampleMaterials) {
            const q = query(collection(db, "materials"), where("name", "==", material.name), where("project", "==", material.project));
            const snap = await getDocs(q);
            if (snap.empty) {
                await addDoc(collection(db, "materials"), material);
                seededCount++;
            }
        }
        
        const leadDocs = await getDocs(collection(db, "leads"));
        if(leadDocs.empty) {
            for (const lead of sampleLeads) {
                const q = query(collection(db, "leads"), where("email", "==", lead.email));
                const snap = await getDocs(q);
                if (snap.empty) {
                    await addDoc(collection(db, "leads"), lead);
                    seededCount++;
                }
            }
        }

        const towerDocs = await getDocs(collection(db, "towers"));
        if (towerDocs.empty) {
            for (const towerData of sampleTowers) {
                const projectId = projectNameToId[towerData.projectName];
                if (projectId) {
                    const towerPayload = {
                        name: towerData.name,
                        floors: towerData.floors,
                        unitsPerFloor: towerData.unitsPerFloor,
                        projectId: projectId,
                    };
                    const towerRef = await addDoc(collection(db, "towers"), towerPayload);
                    seededCount++;

                    for (let f = 1; f <= towerData.floors; f++) {
                        for (let u = 1; u <= towerData.unitsPerFloor; u++) {
                            const unitNumber = `${towerData.name.charAt(0)}-${f}${u.toString().padStart(2, '0')}`;
                            const newProperty = {
                                unitNumber: unitNumber,
                                project: towerData.projectName,
                                projectId: projectId,
                                tower: towerData.name,
                                towerId: towerRef.id,
                                floor: f,
                                type: '2BHK',
                                size: 1200,
                                price: 7500000,
                                status: 'Available',
                                photoUrl: null,
                            };
                            await addDoc(collection(db, 'properties'), newProperty);
                            seededCount++;
                        }
                    }
                }
            }
        }

        if (seededCount > 0) {
            toast({
                title: "Success",
                description: `Added ${seededCount} new sample documents. Please refresh if you don't see users.`,
            });
        } else {
             toast({
                title: "Database is up to date",
                description: "All sample data already exists.",
            });
        }

    } catch (error) {
        console.error("Error seeding database:", error);
        toast({
            title: "Error",
            description: "Could not seed the database.",
            variant: "destructive",
        })
    }
  };


  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4">
            <ConstructWiseLogo className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Welcome to ConstructWise</CardTitle>
        <CardDescription>Select your role and name to login</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={handleRoleChange} value={role} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sitemanager">Site Manager</SelectItem>
                  <SelectItem value="owner">Owner</SelectItem>
                  <SelectItem value="entryguard">Entry Guard</SelectItem>
                  <SelectItem value="salesrep">Sales Representative</SelectItem>
                </SelectContent>
              </Select>
            </div>
             <div className="grid gap-2">
              <Label htmlFor="user">Name</Label>
              <Select onValueChange={setUserId} value={userId} required disabled={!role}>
                <SelectTrigger id="user">
                  <SelectValue placeholder="Select your name" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <p className="text-xs text-muted-foreground text-center">
            First time running the app? Seed the database with sample data.
        </p>
         <Button onClick={seedDatabase} variant="outline" className="w-full">
            <Database className="mr-2 h-4 w-4" />
            Seed Sample Data
        </Button>
      </CardFooter>
    </Card>
  );
}
