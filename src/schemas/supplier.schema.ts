import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(2).max(255),
  contact_email: z.string().email("Invalid email").optional().or(z.literal("")),
  country: z.string().max(100).optional().or(z.literal("")),
});
export type SupplierFormValues = z.infer<typeof supplierSchema>;
