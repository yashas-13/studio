
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConstructWiseLogo } from './icons';

export function LoginForm() {
  const [role, setRole] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    localStorage.setItem('userRole', role);

    if (role === 'owner') {
      router.push('/dashboard/owner');
    } else if (role === 'sitemanager') {
      router.push('/dashboard');
    } else if (role === 'entryguard') {
      router.push('/dashboard/materials');
    } else if (role === 'salesrep') {
      router.push('/dashboard/crm');
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="flex justify-center items-center mb-4">
            <ConstructWiseLogo className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Welcome to ConstructWise</CardTitle>
        <CardDescription>Select your role to login</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select onValueChange={setRole} required>
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
            <Button type="submit" className="w-full">
              Login
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
