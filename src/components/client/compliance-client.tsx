"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, CheckCheck, Loader2, XCircle } from "lucide-react";

import { checkCompliance, type CheckComplianceOutput } from "@/ai/flows/automated-compliance-checks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  description: z.string().min(20, "Please provide a detailed description of the process or material."),
});

export function ComplianceClient() {
  const [result, setResult] = useState<CheckComplianceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await checkCompliance(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to perform compliance check. Please try again.",
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
          <CardTitle>Automated Compliance Check</CardTitle>
          <CardDescription>
            Describe a process or material to check for compliance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Process or Material Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., 'Installation process for fire-rated drywall, type X, using proprietary adhesive XYZ...'" {...field} rows={6} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="mr-2 h-4 w-4" />
                )}
                Check Compliance
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Report</CardTitle>
            <CardDescription>
              The AI will generate a compliance report based on your input.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}
            {result ? (
              <div className="space-y-4">
                <div className={`flex items-center gap-4 p-4 rounded-lg ${result.isCompliant ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                  {result.isCompliant ? <CheckCheck className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                  <p className="font-semibold text-lg">{result.isCompliant ? "Compliant" : "Not Compliant"}</p>
                </div>
                 <div className="space-y-2">
                  <h3 className="font-semibold">Detailed Report</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md whitespace-pre-wrap">{result.report}</p>
                </div>
              </div>
            ) : (
              !isLoading && (
                <div className="text-center text-sm text-muted-foreground p-8">
                  Your compliance report will appear here.
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
