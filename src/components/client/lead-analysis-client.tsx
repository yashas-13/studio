
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Loader2, Sparkles, MoveRight } from "lucide-react";

import { analyzeLead, type AnalyzeLeadOutput } from "@/ai/flows/lead-analysis";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  requirements: z.string().min(10, "Please provide the lead's requirements."),
});

export function LeadAnalysisClient() {
  const [result, setResult] = useState<AnalyzeLeadOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      requirements: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await analyzeLead(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to analyze lead. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Lead Requirements & Notes</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Paste the lead's requirements here... e.g., 'Looking for a 3BHK with a park view. Needs to be on a high floor, corner unit preferred. Budget is around 2 Cr. Asking about loan options.'" {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                )}
                Analyze Lead
                </Button>
            </form>
        </Form>
        
        {isLoading && (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )}

        {result && (
            <div className="space-y-6 pt-4">
                <div>
                    <h3 className="font-semibold text-lg mb-2">Summary</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{result.summary}</p>
                </div>
                <div>
                    <h3 className="font-semibold text-lg mb-2">Key Selling Points</h3>
                    <ul className="space-y-2">
                        {result.keyPoints.map((point, i) => (
                           <li key={i} className="flex items-start gap-2">
                             <MoveRight className="h-4 w-4 mt-1 text-primary" />
                             <span className="text-sm text-muted-foreground">{point}</span>
                           </li>
                        ))}
                    </ul>
                </div>
                 <div>
                    <h3 className="font-semibold text-lg mb-2">Suggested Next Actions</h3>
                     <ul className="space-y-2">
                        {result.nextActions.map((action, i) => (
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
  );
}

    