
'use server';

/**
 * @fileOverview An AI-powered tool that recommends properties from inventory based on a lead's requirements.
 *
 * - recommendProperties - A function that handles the property recommendation process.
 * - PropertyRecommendationInput - The input type for the recommendProperties function.
 * - PropertyRecommendationOutput - The return type for the recommendProperties function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const PropertySchema = z.object({
  id: z.string(),
  unitNumber: z.string(),
  project: z.string(),
  tower: z.string().optional(),
  floor: z.number(),
  type: z.string(), // e.g., '2BHK'
  size: z.number(), // in sqft
  status: z.enum(['Available', 'Booked', 'Sold']),
  price: z.number(),
  photoUrl: z.string().optional(),
});
export type Property = z.infer<typeof PropertySchema>;


export const PropertyRecommendationInputSchema = z.object({
  requirements: z
    .string()
    .describe(
      "The full text of the lead's requirements and preferences."
    ),
  properties: z.array(PropertySchema).describe("A list of available properties in the inventory."),
});
export type PropertyRecommendationInput = z.infer<typeof PropertyRecommendationInputSchema>;

const PropertyRecommendationOutputSchema = z.object({
  recommendedPropertyIds: z.array(z.string()).describe('A list of IDs of the recommended properties from the provided inventory.'),
});
export type PropertyRecommendationOutput = z.infer<typeof PropertyRecommendationOutputSchema>;

export async function recommendProperties(input: PropertyRecommendationInput): Promise<PropertyRecommendationOutput> {
  return recommendPropertiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendPropertiesPrompt',
  input: {schema: PropertyRecommendationInputSchema},
  output: {schema: PropertyRecommendationOutputSchema},
  prompt: `You are an expert real estate sales assistant. Your task is to analyze a potential lead's requirements and recommend the best-matching properties from the available inventory.

You will receive the lead's requirements and a list of available properties in JSON format.

Your goal is to:
1.  Carefully read and understand the lead's needs, such as property type (e.g., 2BHK, 3BHK), budget, preferred location or project, size, and any other specific requests.
2.  Compare these requirements against the list of available properties.
3.  Select up to 3 of the best-matching properties.
4.  Return only the IDs of the recommended properties.

Lead's Requirements:
"{{requirements}}"

Available Properties:
\`\`\`json
{{{json properties}}}
\`\`\`

Based on your analysis, provide the IDs of the most suitable properties.

Output the result in JSON format according to the schema.`,
});

const recommendPropertiesFlow = ai.defineFlow(
  {
    name: 'recommendPropertiesFlow',
    inputSchema: PropertyRecommendationInputSchema,
    outputSchema: PropertyRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
