"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Loader2 } from "lucide-react";

import { wasteReductionAnalysis, type WasteReductionAnalysisOutput } from "@/ai/flows/waste-reduction-analysis";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  historicalData: z.string().min(10, "Please provide detailed historical data."),
  projectTimelines: z.string().min(10, "Please provide detailed project timelines."),
  costPerMaterial: z.string().min(10, "Please provide material cost data."),
});

export function WasteReductionClient() {
  const [result, setResult] = useState<WasteReductionAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      historicalData: "",
      projectTimelines: "",
      costPerMaterial: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await wasteReductionAnalysis(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Waste Reduction Analysis</CardTitle>
          <CardDescription>
            Input historical data to identify potential waste.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="historicalData"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Historical Material Data</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 'Project A, Concrete, 550m³ used, 5% waste...'" {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectTimelines"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Timelines</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe project phases and durations..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="costPerMaterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost Per Material</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 'Concrete: $150/m³, Steel: $800/ton...'" {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                Analyze Waste
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Analysis</CardTitle>
            <CardDescription>
              The AI will provide waste reduction insights.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {result ? (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-semibold">Identified Waste Areas</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.wasteAreas}</p>
                </div>
                 <div className="space-y-2">
                  <h3 className="font-semibold">Optimization Strategies</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.optimizationStrategies}</p>
                </div>
                 <div className="space-y-2">
                  <h3 className="font-semibold">Estimated Savings</h3>
                  <p className="text-sm text-accent-foreground bg-accent/20 p-2 rounded-md font-medium">{result.estimatedSavings}</p>
                </div>
              </div>
            ) : (
              !isLoading && (
                <div className="text-center text-sm text-muted-foreground p-8">
                  Your analysis will appear here.
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
