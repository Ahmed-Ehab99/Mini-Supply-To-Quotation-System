import { z } from "zod";

export const deliveryRateSchema = z.object({
  supplier_id: z.string().uuid(),
  location_id: z.string().uuid(),
  cost_per_unit: z.number().min(0, "Delivery cost cannot be negative"),
  lead_time_days: z.number().int().positive().optional(),
  incoterm: z
    .enum([
      "EXW",
      "FCA",
      "CPT",
      "CIP",
      "DAP",
      "DPU",
      "DDP",
      "FAS",
      "FOB",
      "CFR",
      "CIF",
    ])
    .optional(),
  notes: z.string().optional().or(z.literal("")),
});
export type DeliveryRateFormValues = z.infer<typeof deliveryRateSchema>;
