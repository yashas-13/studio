
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, MoveRight, Sparkles, Building, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { analyzeLead, type AnalyzeLeadOutput } from '@/ai/flows/lead-analysis';
import { recommendProperties, type PropertyRecommendationOutput } from '@/ai/flows/property-recommendation';
import { type Lead } from '@/app/dashboard/crm/page';
import { type Property } from '@/lib/types';
import Link from 'next/link';
import { collection, getDocs, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';


interface LeadActionsProps {
    lead: Lead;
}

export default function LeadActions({ lead }: LeadActionsProps) {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AnalyzeLeadOutput | null>(null);
    const [isRecommending, setIsRecommending] = useState(false);
    const [recommendedProperties, setRecommendedProperties] = useState<Property[] | null>(null);
    const [activities, setActivities] = useState<any[]>([]);

    const { toast } = useToast();

    useEffect(() => {
        if (lead.id) {
            const activityQuery = query(collection(db, 'leads', lead.id, 'activity'), orderBy('date', 'desc'));
            const activityUnsub = onSnapshot(activityQuery, (snapshot) => {
                const activitiesData: any[] = [];
                snapshot.forEach(doc => {
                    activitiesData.push({ id: doc.id, ...doc.data() });
                });
                setActivities(activitiesData);
            });
            return () => activityUnsub();
        }
    }, [lead.id]);

    const handleAnalyzeLead = async () => {
        setIsAnalyzing(true);
        setAnalysisResult(null);
        try {
            const activityHistory = activities.map(a => `${a.user} (${a.type} at ${new Date(a.date?.toDate()).toLocaleString()}): ${a.content}`).join('\n');
            const result = await analyzeLead({
                requirements: lead.requirements,
                activityHistory: activityHistory
            });
            setAnalysisResult(result);
        } catch (error) {
            console.error("Error analyzing lead: ", error);
            toast({ title: "Error", description: "Could not get AI insights.", variant: "destructive" });
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const handleRecommendProperties = async () => {
        setIsRecommending(true);
        setRecommendedProperties(null);
        try {
            const q = query(collection(db, "properties"), where("status", "==", "Available"));
            const snapshot = await getDocs(q);
            const inventoryData = snapshot.docs
              .map(doc => ({ id: doc.id, ...doc.data() }))
              .filter(p => p.projectId) as Property[];
            
            const result = await recommendProperties({
                requirements: lead.requirements,
                properties: inventoryData,
            });

            const recommended = inventoryData.filter(p => result.recommendedPropertyIds.includes(p.id));
            setRecommendedProperties(recommended);
            
        } catch (error) {
            console.error("Error recommending properties: ", error);
            toast({ title: "Error", description: "Could not get AI recommendations.", variant: "destructive" });
        } finally {
            setIsRecommending(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>AI-Powered Actions</CardTitle>
                <CardDescription>Use AI to get insights and find properties for this lead.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className='p-4 border rounded-lg'>
                    <h3 className="font-semibold text-md mb-2">Lead Insights</h3>
                    <p className="text-sm text-muted-foreground mb-4">Analyze lead history to generate talking points and next actions.</p>
                     <Button onClick={handleAnalyzeLead} disabled={isAnalyzing} className="w-full">
                        {isAnalyzing ? <Loader2 className="animate-spin mr-2"/> : <Sparkles className="mr-2" />}
                        Generate Insights
                    </Button>
                     {isAnalyzing && (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                    {analysisResult && (
                        <div className="space-y-6 pt-4">
                            <div>
                                <h3 className="font-semibold text-md mb-2">Summary</h3>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{analysisResult.summary}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-md mb-2">Key Points</h3>
                                <ul className="space-y-2">
                                    {analysisResult.keyPoints.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <MoveRight className="h-4 w-4 mt-1 text-primary" />
                                        <span className="text-sm text-muted-foreground">{point}</span>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold text-md mb-2">Next Actions</h3>
                                <ul className="space-y-2">
                                    {analysisResult.nextActions.map((action, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <MoveRight className="h-4 w-4 mt-1 text-primary" />
                                        <span className="text-sm text-muted-foreground">{action}</span>
                                    </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                 <div className='p-4 border rounded-lg'>
                    <h3 className="font-semibold text-md mb-2">Property Recommendations</h3>
                    <p className="text-sm text-muted-foreground mb-4">Find the best matching properties from your available inventory.</p>
                    <Button onClick={handleRecommendProperties} disabled={isRecommending} className="w-full">
                        {isRecommending ? <Loader2 className="animate-spin mr-2"/> : <Home className="mr-2" />}
                        Find Properties
                    </Button>
                     {isRecommending && (
                        <div className="flex items-center justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    )}
                     {recommendedProperties && (
                        <div className="space-y-4 pt-4">
                            {recommendedProperties.length > 0 ? (
                                recommendedProperties.map(prop => (
                                    <Link key={prop.id} href={`/dashboard/inventory/${prop.id}`}>
                                        <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                                            <div className="font-semibold">{prop.unitNumber} in {prop.tower || prop.project}</div>
                                            <div className="text-sm text-muted-foreground flex justify-between">
                                                <span>{prop.type} / {prop.size} sqft</span>
                                                <span className="font-medium text-foreground">₹{prop.price.toLocaleString('en-IN')}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center p-4">No suitable properties found in the available inventory.</p>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
