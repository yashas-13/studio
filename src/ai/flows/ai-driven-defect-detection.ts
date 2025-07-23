// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview An AI-powered tool that analyzes drone imagery to detect potential defects or safety violations on the construction site in real-time.
 *
 * - aiDrivenDefectDetection - A function that handles the defect detection process.
 * - AiDrivenDefectDetectionInput - The input type for the aiDrivenDefectDetection function.
 * - AiDrivenDefectDetectionOutput - The return type for the aiDrivenDefectDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiDrivenDefectDetectionInputSchema = z.object({
  droneImageDataUri: z
    .string()
    .describe(
      "A photo from a drone, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  projectDescription: z
    .string()
    .describe('The description of the construction project.'),
  knownDefects: z
    .string()
    .optional()
    .describe('List of known defects on the project for reference.'),
});
export type AiDrivenDefectDetectionInput = z.infer<typeof AiDrivenDefectDetectionInputSchema>;

const AiDrivenDefectDetectionOutputSchema = z.object({
  defectsDetected: z.array(
    z.object({
      defectType: z.string().describe('The type of defect detected.'),
      location: z.string().describe('The location of the defect on the site.'),
      severity: z.string().describe('The severity of the defect (e.g., low, medium, high).'),
      details: z.string().describe('Additional details about the defect.'),
    })
  ).describe('A list of defects detected in the drone imagery.'),
  safetyViolations: z.array(
    z.object({
      violationType: z.string().describe('The type of safety violation detected.'),
      location: z.string().describe('The location of the safety violation on the site.'),
      severity: z.string().describe('The severity of the safety violation (e.g., low, medium, high).'),
      details: z.string().describe('Additional details about the safety violation.'),
    })
  ).describe('A list of safety violations detected in the drone imagery.'),
  overallAssessment: z.string().describe('An overall assessment of the construction site based on the analysis.'),
});
export type AiDrivenDefectDetectionOutput = z.infer<typeof AiDrivenDefectDetectionOutputSchema>;

export async function aiDrivenDefectDetection(input: AiDrivenDefectDetectionInput): Promise<AiDrivenDefectDetectionOutput> {
  return aiDrivenDefectDetectionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiDrivenDefectDetectionPrompt',
  input: {schema: AiDrivenDefectDetectionInputSchema},
  output: {schema: AiDrivenDefectDetectionOutputSchema},
  prompt: `You are an expert in construction quality control and safety.

You are provided with drone imagery of a construction site and your task is to identify potential defects and safety violations.

Project Description: {{{projectDescription}}}
Known Defects (if any): {{{knownDefects}}}

Analyze the drone imagery for any defects or safety violations. Defects could include structural issues, material defects, or deviations from the project plan. Safety violations could include lack of protective equipment, unsafe working conditions, or non-compliance with safety regulations.

Drone Imagery: {{media url=droneImageDataUri}}

Based on your analysis, provide a detailed report including:

- A list of defects detected, including the type, location, severity, and details.
- A list of safety violations detected, including the type, location, severity, and details.
- An overall assessment of the construction site based on the analysis.

Ensure that your report is clear, concise, and actionable. Focus on providing information that will help the quality control manager quickly identify and address issues on the construction site.

Output the result in JSON format according to the schema.`,
});

const aiDrivenDefectDetectionFlow = ai.defineFlow(
  {
    name: 'aiDrivenDefectDetectionFlow',
    inputSchema: AiDrivenDefectDetectionInputSchema,
    outputSchema: AiDrivenDefectDetectionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
