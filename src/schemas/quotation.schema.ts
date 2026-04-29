import { z } from "zod";

export const quotationSchema = z.object({
  customer_id: z.string().uuid("Select a customer"),
  destination_id: z.string().uuid("Select a destination"),
  reference_number: z.string().min(3).max(100),
  valid_until: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});
export type QuotationFormValues = z.infer<typeof quotationSchema>;
