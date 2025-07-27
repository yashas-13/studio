
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Building, Mail, Phone, User, Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Lead, type LeadStatus } from '@/app/dashboard/crm/page';
import { updateLeadDetails, updateLeadStatus } from '@/app/dashboard/crm/actions';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LeadDetailsCardProps {
    lead: Lead;
}

export default function LeadDetailsCard({ lead }: LeadDetailsCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editedLead, setEditedLead] = useState<Partial<Lead>>({});
    const { toast } = useToast();

    const getStatusVariant = (status: Lead['status']): "secondary" | "outline" | "default" | "destructive" => {
        switch (status) {
          case 'New': return 'default';
          case 'Contacted': return 'outline';
          case 'Qualified': return 'secondary';
          case 'Lost': return 'destructive';
          default: return 'default';
        }
    }

    const handleStatusChange = async (newStatus: LeadStatus) => {
        try {
            await updateLeadStatus(lead.id, newStatus);
            toast({ title: "Status Updated", description: `${lead.name}'s status changed to ${newStatus}.`});
        } catch (error) {
            console.error("Error updating status: ", error);
            toast({ title: "Error", description: "Could not update lead status.", variant: "destructive" });
        }
    }

    const handleEditToggle = () => {
        if (!isEditing) {
            setEditedLead({
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
            });
        }
        setIsEditing(!isEditing);
    }
    
    const handleInputChange = (field: keyof Lead, value: string) => {
        setEditedLead(prev => ({ ...prev, [field]: value }));
    }

    const handleSave = async () => {
        try {
            await updateLeadDetails(lead.id, editedLead);
            toast({ title: "Details Updated", description: "Lead information has been saved."});
            setIsEditing(false);
        } catch (error) {
             console.error("Error updating details: ", error);
            toast({ title: "Error", description: "Could not update lead details.", variant: "destructive" });
        }
    }
    
    return (
        <Card>
            <CardHeader>
                <div className='flex justify-between items-start'>
                    <div>
                        <CardTitle>Contact Details</CardTitle>
                        <CardDescription>Customer information</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleEditToggle}>
                        {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center text-center">
                     <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={`https://i.pravatar.cc/150?u=${lead.email}`} alt={lead.name} />
                        <AvatarFallback>{lead.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    {isEditing ? (
                        <Input className='text-xl font-semibold text-center mb-2' value={editedLead.name || ''} onChange={(e) => handleInputChange('name', e.target.value)} />
                    ) : (
                        <h2 className="text-xl font-semibold">{lead.name}</h2>
                    )}
                    
                    <div className="mt-2">
                         <Select value={lead.status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="w-[120px]">
                                <SelectValue>
                                     <Badge className="capitalize" variant={getStatusVariant(lead.status)}>{lead.status}</Badge>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="New">New</SelectItem>
                                <SelectItem value="Contacted">Contacted</SelectItem>
                                <SelectItem value="Qualified">Qualified</SelectItem>
                                <SelectItem value="Lost">Lost</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                </div>
                <div className="mt-6 space-y-3 text-sm">
                    {isEditing ? (
                        <>
                         <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="email">Email</Label>
                            <Input type="email" id="email" value={editedLead.email || ''} onChange={(e) => handleInputChange('email', e.target.value)} />
                        </div>
                        <div className="grid w-full items-center gap-1.5">
                            <Label htmlFor="phone">Phone</Label>
                            <Input type="tel" id="phone" value={editedLead.phone || ''} onChange={(e) => handleInputChange('phone', e.target.value)} />
                        </div>
                        </>

                    ) : (
                        <>
                        <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{lead.email}</span>
                        </div>
                         <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">{lead.phone || "Not provided"}</span>
                        </div>
                        </>
                    )}
                    <div className="flex items-center gap-3">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Assigned to: {lead.assignedTo}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Project: {lead.projectName || "Not specified"}</span>
                    </div>
                </div>
                 {isEditing && (
                    <Button onClick={handleSave} className="w-full mt-4">
                        <Save className="mr-2" />
                        Save Changes
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
