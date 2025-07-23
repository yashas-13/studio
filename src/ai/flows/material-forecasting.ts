'use server';

/**
 * @fileOverview Forecasts material needs based on project timelines and current inventory.
 *
 * - materialForecasting - A function that handles the material forecasting process.
 * - MaterialForecastingInput - The input type for the materialForecasting function.
 * - MaterialForecastingOutput - The return type for the materialForecasting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MaterialForecastingInputSchema = z.object({
  projectTimeline: z
    .string()
    .describe(
      'Detailed project timeline, including start and end dates for each phase.'
    ),
  currentInventory: z
    .string()
    .describe('Current material inventory levels for each material type.'),
  materialUsageHistory: z
    .string()
    .optional()
    .describe(
      'Historical data on material usage for similar projects (optional).' // Making this optional.
    ),
  forecastHorizon: z
    .string()
    .describe('How far into the future material needs should be forecasted.'),
});
export type MaterialForecastingInput = z.infer<typeof MaterialForecastingInputSchema>;

const MaterialForecastingOutputSchema = z.object({
  materialForecast: z
    .string()
    .describe(
      'A detailed forecast of material needs over the specified timeline, including quantities and delivery dates.'
    ),
  potentialShortages: z
    .string()
    .describe(
      'Identifies any potential material shortages based on the forecast.'
    ),
  procurementRecommendations: z
    .string()
    .describe(
      'Recommendations for procurement, including quantities to order and optimal order dates.'
    ),
});
export type MaterialForecastingOutput = z.infer<typeof MaterialForecastingOutputSchema>;

export async function materialForecasting(input: MaterialForecastingInput): Promise<MaterialForecastingOutput> {
  return materialForecastingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'materialForecastingPrompt',
  input: {schema: MaterialForecastingInputSchema},
  output: {schema: MaterialForecastingOutputSchema},
  prompt: `You are an AI assistant that helps project managers forecast material needs for construction projects.

  Based on the provided project timeline, current inventory, material usage history (if available), and the desired forecast horizon, generate a detailed material forecast. Identify potential shortages and provide procurement recommendations.

  Project Timeline: {{{projectTimeline}}}
  Current Inventory: {{{currentInventory}}}
  Material Usage History (Optional): {{#if materialUsageHistory}}{{{materialUsageHistory}}}{{else}}Not provided{{/if}}
  Forecast Horizon: {{{forecastHorizon}}}

  Material Forecast:
  Potential Shortages:
  Procurement Recommendations:`,
});

const materialForecastingFlow = ai.defineFlow(
  {
    name: 'materialForecastingFlow',
    inputSchema: MaterialForecastingInputSchema,
    outputSchema: MaterialForecastingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
