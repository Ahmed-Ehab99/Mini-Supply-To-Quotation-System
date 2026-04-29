import { z } from "zod";

export const materialSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  description: z.string().max(1000).optional().or(z.literal("")),
  unit: z.enum(["kg", "ton", "unit", "meter", "liter", "m2", "m3"]),
  category: z.enum([
    "raw_material",
    "component",
    "consumable",
    "equipment",
    "packaging",
  ]),
});
export type MaterialFormValues = z.infer<typeof materialSchema>;
