
'use server';

/**
 * @fileOverview An AI-powered tool that analyzes a lead's requirements to provide summaries and suggested next actions.
 *
 * - analyzeLead - A function that handles the lead analysis process.
 * - AnalyzeLeadInput - The input type for the analyzeLead function.
 * - AnalyzeLeadOutput - The return type for the analyzeLead function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeLeadInputSchema = z.object({
  requirements: z
    .string()
    .describe(
      "The full text of the lead's requirements and notes."
    ),
});
export type AnalyzeLeadInput = z.infer<typeof AnalyzeLeadInputSchema>;

const AnalyzeLeadOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the lead\'s key requirements.'),
  keyPoints: z.array(z.string()).describe('A list of key selling points to highlight based on the requirements.'),
  nextActions: z.array(z.string()).describe('A list of suggested next actions for the sales representative.'),
});
export type AnalyzeLeadOutput = z.infer<typeof AnalyzeLeadOutputSchema>;

export async function analyzeLead(input: AnalyzeLeadInput): Promise<AnalyzeLeadOutput> {
  return analyzeLeadFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeLeadPrompt',
  input: {schema: AnalyzeLeadInputSchema},
  output: {schema: AnalyzeLeadOutputSchema},
  prompt: `You are an expert sales assistant for a real estate company. Your task is to analyze the requirements of a potential lead and provide actionable insights for the sales representative.

You will receive the raw text of a lead's requirements. Your goal is to:
1.  Summarize the most important requirements into a clear, concise paragraph.
2.  Identify and list the key selling points or project features that would be most appealing to this lead.
3.  Suggest a short list of concrete next actions the sales representative should take.

Lead Requirements:
{{{requirements}}}

Based on your analysis, provide the summary, key selling points, and next actions.

Output the result in JSON format according to the schema.`,
});

const analyzeLeadFlow = ai.defineFlow(
  {
    name: 'analyzeLeadFlow',
    inputSchema: AnalyzeLeadInputSchema,
    outputSchema: AnalyzeLeadOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    