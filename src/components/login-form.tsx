
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConstructWiseLogo } from './icons';
import { db, collection, onSnapshot } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  role: string;
}

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
    </Card>
  );
}
