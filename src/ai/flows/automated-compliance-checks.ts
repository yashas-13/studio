'use server';

/**
 * @fileOverview This file defines a Genkit flow for automated compliance checks of construction processes and materials.
 *
 * The flow takes a description of a construction process or material and checks it against industry regulations.
 * It returns a compliance report indicating whether the process or material is compliant.
 *
 * @exports {checkCompliance} - The main function to initiate the compliance check flow.
 * @exports {CheckComplianceInput} - The input type for the checkCompliance function.
 * @exports {CheckComplianceOutput} - The output type for the checkCompliance function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CheckComplianceInputSchema = z.object({
  description: z.string().describe('A detailed description of the construction process or material to be checked for compliance.'),
});
export type CheckComplianceInput = z.infer<typeof CheckComplianceInputSchema>;

const CheckComplianceOutputSchema = z.object({
  isCompliant: z.boolean().describe('Whether the construction process or material is compliant with industry regulations.'),
  report: z.string().describe('A detailed report outlining the compliance status, including any violations or areas of concern.'),
});
export type CheckComplianceOutput = z.infer<typeof CheckComplianceOutputSchema>;

export async function checkCompliance(input: CheckComplianceInput): Promise<CheckComplianceOutput> {
  return checkComplianceFlow(input);
}

const complianceCheckPrompt = ai.definePrompt({
  name: 'complianceCheckPrompt',
  input: {schema: CheckComplianceInputSchema},
  output: {schema: CheckComplianceOutputSchema},
  prompt: `You are an expert in construction industry regulations.
  Your task is to review the provided description of a construction process or material and determine if it complies with industry regulations.
  Generate a detailed report outlining the compliance status. If the process or material is not compliant, specify the violations and areas of concern.

  Description: {{{description}}}
  `,
});

const checkComplianceFlow = ai.defineFlow(
  {
    name: 'checkComplianceFlow',
    inputSchema: CheckComplianceInputSchema,
    outputSchema: CheckComplianceOutputSchema,
  },
  async input => {
    const {output} = await complianceCheckPrompt(input);
    return output!;
  }
);
