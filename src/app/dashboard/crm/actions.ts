
'use server';

import { db } from "@/lib/firebase";
import { doc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";
import { type Lead, type LeadStatus } from "./page";

export async function updateLeadStatus(leadId: string, newStatus: LeadStatus) {
    const leadRef = doc(db, 'leads', leadId);
    await updateDoc(leadRef, { status: newStatus });
    
    await addDoc(collection(db, 'leads', leadId, 'activity'), {
        type: 'Status Change',
        content: `Status changed to ${newStatus}.`,
        date: serverTimestamp(),
        user: 'Anjali Sharma' // Placeholder user
    });
    revalidatePath(`/dashboard/crm/${leadId}`);
}

export async function updateLeadDetails(leadId: string, data: Partial<Lead>) {
    const leadRef = doc(db, 'leads', leadId);
    await updateDoc(leadRef, data);
    
    const changes = Object.entries(data).map(([key, value]) => `${key} was updated`).join(', ');

    await addDoc(collection(db, 'leads', leadId, 'activity'), {
        type: 'Note',
        content: `Lead details updated: ${changes}.`,
        date: serverTimestamp(),
        user: 'Anjali Sharma' // Placeholder user
    });
    revalidatePath(`/dashboard/crm/${leadId}`);
}

export async function addLeadNote(leadId: string, note: string) {
    if (!note.trim()) return;
    await addDoc(collection(db, 'leads', leadId, 'activity'), {
        type: 'Note',
        content: note,
        date: serverTimestamp(),
        user: 'Anjali Sharma' // Placeholder user
    });
    revalidatePath(`/dashboard/crm/${leadId}`);
}

export async function addLeadDocument(leadId: string, leadName: string, fileName: string, fileType: string, fileSize: string) {
    if (!fileName.trim()) return;

    // Add to the centralized files collection
    await addDoc(collection(db, 'files'), {
        name: fileName,
        type: fileType,
        size: fileSize,
        url: '#', // Placeholder URL, in a real app this would be a Firebase Storage URL
        date: new Date().toISOString(),
        uploadedBy: 'Anjali Sharma', // Placeholder user
        leadId: leadId,
        leadName: leadName,
    });

    // Log the activity on the lead's subcollection
    await addDoc(collection(db, 'leads', leadId, 'activity'), {
        type: 'Note',
        content: `Document uploaded: ${fileName}.`,
        date: serverTimestamp(),
        user: 'Anjali Sharma'
    });
    revalidatePath(`/dashboard/crm/${leadId}`);
}


export async function reassignLead(leadId: string, oldAssignee: string, newAssignee: string) {
    const leadRef = doc(db, 'leads', leadId);
    await updateDoc(leadRef, { assignedTo: newAssignee });
    
    await addDoc(collection(db, 'leads', leadId, 'activity'), {
        type: 'Status Change',
        content: `Lead reassigned from ${oldAssignee} to ${newAssignee}.`,
        date: serverTimestamp(),
        user: 'Owner' // Placeholder for system/owner action
    });
    revalidatePath(`/dashboard/crm/${leadId}`);
    revalidatePath(`/dashboard/users`);
}
