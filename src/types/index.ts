import type { Database } from "./database";

export type Material = Database["public"]["Tables"]["material"]["Row"];
export type MaterialInsert = Database["public"]["Tables"]["material"]["Insert"];
export type Supplier = Database["public"]["Tables"]["supplier"]["Row"];
export type SupplierInsert = Database["public"]["Tables"]["supplier"]["Insert"];
export type Location = Database["public"]["Tables"]["location"]["Row"];
export type LocationInsert = Database["public"]["Tables"]["location"]["Insert"];
export type Customer = Database["public"]["Tables"]["customer"]["Row"];
export type CustomerInsert = Database["public"]["Tables"]["customer"]["Insert"];
export type SupplierOffer = Database["public"]["Tables"]["supplier_offer"]["Row"];
export type SupplierOfferInsert = Database["public"]["Tables"]["supplier_offer"]["Insert"];
export type DeliveryRate = Database["public"]["Tables"]["delivery_rate"]["Row"];
export type DeliveryRateInsert = Database["public"]["Tables"]["delivery_rate"]["Insert"];
export type Quotation = Database["public"]["Tables"]["quotation"]["Row"];
export type QuotationInsert = Database["public"]["Tables"]["quotation"]["Insert"];
export type QuotationLine = Database["public"]["Tables"]["quotation_line"]["Row"];
export type QuotationLineInsert = Database["public"]["Tables"]["quotation_line"]["Insert"];

export type {
  MaterialUnit,
  MaterialCategory,
  OfferStatus,
  QuotationStatus,
  IncotermType,
} from "./database";

export interface SupplierOfferWithDetails extends SupplierOffer {
  supplier: Pick<Supplier, "id" | "name" | "country">;
  material: Pick<Material, "id" | "name" | "unit">;
  delivery_rate: Pick<
    DeliveryRate,
    "id" | "cost_per_unit" | "lead_time_days" | "incoterm"
  > | null;
  effective_price: number;
}

export interface QuotationLineWithDetails extends QuotationLine {
  material: Pick<Material, "id" | "name" | "unit">;
  selected_offer: SupplierOffer & { supplier: Pick<Supplier, "id" | "name"> };
  delivery_rate: Pick<DeliveryRate, "id" | "cost_per_unit" | "incoterm"> | null;
}

export interface QuotationWithDetails extends Quotation {
  customer: Pick<Customer, "id" | "name" | "country">;
  destination: Pick<Location, "id" | "name" | "city" | "country">;
  lines: QuotationLineWithDetails[];
}
