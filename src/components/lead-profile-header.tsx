
'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LeadProfileHeader() {
    const router = useRouter();
    return (
        <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ArrowLeft />
            </Button>
            <div>
                <h1 className="text-2xl font-semibold">Lead Profile</h1>
                <p className="text-sm text-muted-foreground">Detailed view of customer information and activity.</p>
            </div>
        </div>
    );
}
