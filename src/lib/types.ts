
import { z } from 'zod';

export const PropertySchema = z.object({
  id: z.string(),
  unitNumber: z.string(),
  project: z.string(),
  projectId: z.string(),
  tower: z.string().optional(),
  towerId: z.string().optional(),
  floor: z.number(),
  type: z.string(), // e.g., '2BHK'
  size: z.number(), // in sqft
  status: z.enum(['Available', 'Booked', 'Sold']),
  price: z.number(),
  photoUrl: z.string().nullable().optional(),
  bookedByLeadId: z.string().nullable().optional(),
  bookedByLeadName: z.string().nullable().optional(),
});
export type Property = z.infer<typeof PropertySchema>;
