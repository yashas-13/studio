"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, Loader2 } from "lucide-react";

import { materialForecasting, type MaterialForecastingOutput } from "@/ai/flows/material-forecasting";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  projectTimeline: z.string().min(10, "Please provide a more detailed project timeline."),
  currentInventory: z.string().min(10, "Please provide more details on current inventory."),
  materialUsageHistory: z.string().optional(),
  forecastHorizon: z.string().min(3, "Please specify a forecast horizon (e.g., '3 months')."),
});

export function ForecastingClient() {
  const [result, setResult] = useState<MaterialForecastingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectTimeline: "",
      currentInventory: "",
      materialUsageHistory: "",
      forecastHorizon: "3 months",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await materialForecasting(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to generate forecast. Please try again.",
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
          <CardTitle>Material Forecasting</CardTitle>
          <CardDescription>
            Provide project details to forecast future material needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="projectTimeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Timeline</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe project phases and durations..." {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentInventory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Inventory</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List current stock levels, e.g., 'Concrete: 100m³, Rebar: 20 tons'" {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="materialUsageHistory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Usage History (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Provide historical data from similar projects..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="forecastHorizon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forecast Horizon</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., '3 months' or 'End of project'" {...field} rows={1} />
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
                Generate Forecast
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>AI-Generated Forecast</CardTitle>
            <CardDescription>
              The AI will provide a forecast based on your inputs.
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
                  <h3 className="font-semibold">Material Forecast</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.materialForecast}</p>
                </div>
                 <div className="space-y-2">
                  <h3 className="font-semibold">Potential Shortages</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.potentialShortages}</p>
                </div>
                 <div className="space-y-2">
                  <h3 className="font-semibold">Procurement Recommendations</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.procurementRecommendations}</p>
                </div>
              </div>
            ) : (
              !isLoading && (
                <div className="text-center text-sm text-muted-foreground p-8">
                  Your forecast will appear here.
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
