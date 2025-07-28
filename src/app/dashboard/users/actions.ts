
'use server';

import { db } from "@/lib/firebase";
import { doc, updateDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { revalidatePath } from "next/cache";

interface UserUpdateData {
    name?: string;
    email?: string;
    role?: 'sitemanager' | 'owner' | 'entryguard' | 'salesrep';
}

export async function updateUser(userId: string, data: UserUpdateData) {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, data);

    // Optional: Log this change to an audit trail or activity feed
    const changes = Object.entries(data).map(([key, value]) => `${key} was updated`).join(', ');
     await addDoc(collection(db, "activityFeed"), {
        type: 'USER_UPDATE',
        user: 'Owner', // Assuming only an owner can do this
        details: `User ${userId} details updated: ${changes}.`,
        timestamp: serverTimestamp()
    });

    revalidatePath(`/dashboard/users`);
    revalidatePath(`/dashboard/users/${userId}`);
}
