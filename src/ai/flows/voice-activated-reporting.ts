'use server';

/**
 * @fileOverview Implements voice-activated report generation using Genkit and TTS.
 *
 * - generateReportFromVoice - Generates a report based on voice commands, converts the report
 *   to speech, and returns an audio data URI.
 * - GenerateReportFromVoiceInput - The input type for the generateReportFromVoice function.
 * - GenerateReportFromVoiceOutput - The return type for the generateReportFromVoice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateReportFromVoiceInputSchema = z.object({
  voiceCommand: z
    .string()
    .describe('Voice command requesting the creation of a report.'),
});
export type GenerateReportFromVoiceInput = z.infer<
  typeof GenerateReportFromVoiceInputSchema
>;

const GenerateReportFromVoiceOutputSchema = z.object({
  reportAudio: z
    .string()
    .describe('Audio data URI containing the report spoken aloud.'),
});
export type GenerateReportFromVoiceOutput = z.infer<
  typeof GenerateReportFromVoiceOutputSchema
>;

export async function generateReportFromVoice(
  input: GenerateReportFromVoiceInput
): Promise<GenerateReportFromVoiceOutput> {
  return generateReportFromVoiceFlow(input);
}

const reportGenerationPrompt = ai.definePrompt({
  name: 'reportGenerationPrompt',
  input: {schema: GenerateReportFromVoiceInputSchema},
  prompt: `You are an AI assistant specialized in generating construction site reports based on voice commands.

  Generate a concise report based on the following voice command:

  Voice Command: {{{voiceCommand}}}

  The report should include key information such as material usage, project progress, and any potential issues or delays.`,
});

const generateReportFromVoiceFlow = ai.defineFlow(
  {
    name: 'generateReportFromVoiceFlow',
    inputSchema: GenerateReportFromVoiceInputSchema,
    outputSchema: GenerateReportFromVoiceOutputSchema,
  },
  async input => {
    const {text} = await reportGenerationPrompt(input);

    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-preview-tts',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {voiceName: 'Algenib'},
          },
        },
      },
      prompt: text ?? 'Report generation failed.',
    });

    if (!media) {
      throw new Error('No media returned from TTS.');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const reportAudio = 'data:audio/wav;base64,' + (await toWav(audioBuffer));

    return {reportAudio};
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: any[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
