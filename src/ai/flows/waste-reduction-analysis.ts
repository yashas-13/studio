'use server';

/**
 * @fileOverview Waste reduction analysis flow using AI to identify waste areas and suggest optimization strategies.
 *
 * - wasteReductionAnalysis - A function that analyzes historical material usage data for waste reduction.
 * - WasteReductionAnalysisInput - The input type for the wasteReductionAnalysis function.
 * - WasteReductionAnalysisOutput - The return type for the wasteReductionAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WasteReductionAnalysisInputSchema = z.object({
  historicalData: z
    .string()
    .describe(
      'Historical data of material usage, including material type, quantity used, project area, and date.'
    ),
  projectTimelines: z.string().describe('Project timelines and schedules.'),
  costPerMaterial: z
    .string()
    .describe('The cost per material of each material type.'),
});
export type WasteReductionAnalysisInput = z.infer<
  typeof WasteReductionAnalysisInputSchema
>;

const WasteReductionAnalysisOutputSchema = z.object({
  wasteAreas: z
    .string()
    .describe('Identified areas of potential material waste.'),
  optimizationStrategies: z
    .string()
    .describe('Suggested strategies to optimize material usage and reduce waste.'),
  estimatedSavings: z
    .string()
    .describe('Estimated cost savings from implementing the suggested strategies.'),
});
export type WasteReductionAnalysisOutput = z.infer<
  typeof WasteReductionAnalysisOutputSchema
>;

export async function wasteReductionAnalysis(
  input: WasteReductionAnalysisInput
): Promise<WasteReductionAnalysisOutput> {
  return wasteReductionAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'wasteReductionAnalysisPrompt',
  input: {schema: WasteReductionAnalysisInputSchema},
  output: {schema: WasteReductionAnalysisOutputSchema},
  prompt: `You are an AI assistant that analyzes construction material usage data to identify waste and suggest optimization strategies.

  Analyze the provided historical material usage data, project timelines, and material costs to identify areas where material waste is occurring.
  Suggest specific strategies to optimize material usage, reduce waste, and save costs.
  Estimate the potential cost savings from implementing the suggested strategies.

  Here is the historical material usage data:
  {{{historicalData}}}

  Here are the project timelines and schedules:
  {{{projectTimelines}}}

  Here are the cost per material of each material type:
  {{{costPerMaterial}}}

  Provide your analysis, suggested strategies, and estimated savings in a clear and concise manner.

  Waste Areas:
  Optimization Strategies:
  Estimated Savings: `,
});

const wasteReductionAnalysisFlow = ai.defineFlow(
  {
    name: 'wasteReductionAnalysisFlow',
    inputSchema: WasteReductionAnalysisInputSchema,
    outputSchema: WasteReductionAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
