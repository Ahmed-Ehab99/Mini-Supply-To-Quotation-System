import { z } from "zod";

export const supplierOfferSchema = z
  .object({
    material_id: z.string().uuid("Select a material"),
    supplier_id: z.string().uuid("Select a supplier"),
    unit_price: z
      .number({ invalid_type_error: "Price must be a number" })
      .positive("Price must be > 0"),
    currency: z.string().length(3),
    valid_from: z.string().min(1, "Valid from date is required"),
    valid_until: z.string().optional().or(z.literal("")),
    status: z.enum(["active", "expired", "withdrawn"]),
    notes: z.string().max(1000).optional().or(z.literal("")),
  })
  .refine((d) => !d.valid_until || d.valid_until > d.valid_from, {
    message: "Expiry must be after start date",
    path: ["valid_until"],
  });
export type SupplierOfferFormValues = z.infer<typeof supplierOfferSchema>;
