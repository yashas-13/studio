"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Bot, HardHat, Image as ImageIcon, Loader2 } from "lucide-react";
import Image from "next/image";

import { aiDrivenDefectDetection, type AiDrivenDefectDetectionOutput } from "@/ai/flows/ai-driven-defect-detection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";

const formSchema = z.object({
  droneImageDataUri: z.string().refine(val => val.startsWith('data:image/'), {
    message: "Please upload a valid image file."
  }),
  projectDescription: z.string().min(10, "Please provide a detailed project description."),
  knownDefects: z.string().optional(),
});

export function DefectDetectionClient() {
  const [result, setResult] = useState<AiDrivenDefectDetectionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      droneImageDataUri: "",
      projectDescription: "Downtown Tower, 45-story high-rise construction.",
      knownDefects: "Minor cracks observed on level 14 north-side beams.",
    },
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        form.setValue("droneImageDataUri", dataUri);
        setPreview(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setResult(null);
    try {
      const res = await aiDrivenDefectDetection(values);
      setResult(res);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to analyze image. Please try again.",
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
          <CardTitle>AI-Driven Defect Detection</CardTitle>
          <CardDescription>
            Upload drone imagery to detect potential defects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="droneImageDataUri"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drone Image</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" onChange={handleFileChange} />
                    </FormControl>
                    <FormDescription>Upload an image from a drone.</FormDescription>
                    {preview && <Image src={preview} alt="Drone image preview" width={200} height={150} className="mt-2 rounded-md" data-ai-hint="construction drone" />}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="projectDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe the project..." {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="knownDefects"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Known Defects (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="List any known issues..." {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading || !preview} className="w-full">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <HardHat className="mr-2 h-4 w-4" />}
                Analyze Image
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              Defects and safety violations identified by the AI.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>}
            {result ? (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Defects Detected</h3>
                  {result.defectsDetected.length > 0 ? (
                    <Table>
                      <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Location</TableHead><TableHead>Severity</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {result.defectsDetected.map((d, i) => <TableRow key={i}><TableCell>{d.defectType}</TableCell><TableCell>{d.location}</TableCell><TableCell><Badge variant="destructive">{d.severity}</Badge></TableCell></TableRow>)}
                      </TableBody>
                    </Table>
                  ) : <p className="text-sm text-muted-foreground">No defects detected.</p>}
                </div>
                 <div>
                  <h3 className="font-semibold mb-2">Safety Violations</h3>
                  {result.safetyViolations.length > 0 ? (
                    <Table>
                      <TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Location</TableHead><TableHead>Severity</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {result.safetyViolations.map((v, i) => <TableRow key={i}><TableCell>{v.violationType}</TableCell><TableCell>{v.location}</TableCell><TableCell><Badge variant="destructive">{v.severity}</Badge></TableCell></TableRow>)}
                      </TableBody>
                    </Table>
                  ) : <p className="text-sm text-muted-foreground">No safety violations detected.</p>}
                </div>
                 <div>
                  <h3 className="font-semibold">Overall Assessment</h3>
                  <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{result.overallAssessment}</p>
                </div>
              </div>
            ) : !isLoading && <div className="text-center text-sm text-muted-foreground p-8"><ImageIcon className="mx-auto h-8 w-8 text-muted-foreground mb-2"/>Your analysis will appear here.</div>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
