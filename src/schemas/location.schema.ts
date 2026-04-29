import { z } from "zod";

export const locationSchema = z.object({
  name: z.string().min(2).max(255),
  city: z.string().min(1).max(100),
  country: z.string().min(1).max(100),
  zone_code: z.string().max(50).optional().or(z.literal("")),
});
export type LocationFormValues = z.infer<typeof locationSchema>;
