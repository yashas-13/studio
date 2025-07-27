
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Lead } from '@/app/dashboard/crm/page';
import { updateLeadDetails } from '@/app/dashboard/crm/actions';
import { Textarea } from './ui/textarea';

interface LeadRequirementsCardProps {
    lead: Lead;
}

export default function LeadRequirementsCard({ lead }: LeadRequirementsCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [requirements, setRequirements] = useState(lead.requirements || "");
    const { toast } = useToast();

    const handleSave = async () => {
        try {
            await updateLeadDetails(lead.id, { requirements });
            toast({ title: "Requirements Updated", description: "Lead requirements have been saved." });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating requirements: ", error);
            toast({ title: "Error", description: "Could not update requirements.", variant: "destructive" });
        }
    }
    
    return (
         <Card>
            <CardHeader>
                 <div className='flex justify-between items-start'>
                    <div>
                        <CardTitle>Lead Requirements</CardTitle>
                        <CardDescription>Specific needs and preferences.</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? <X className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {isEditing ? (
                    <div className="space-y-4">
                        <Textarea 
                            value={requirements}
                            onChange={(e) => setRequirements(e.target.value)}
                            rows={6}
                        />
                        <Button onClick={handleSave} className="w-full">
                            <Save className="mr-2" /> Save
                        </Button>
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">
                        {lead.requirements || "No specific requirements have been logged."}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
