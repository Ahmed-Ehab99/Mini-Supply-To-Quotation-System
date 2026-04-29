import { supabase } from "@/lib/supabase";
import type {
  DeliveryOption,
  Location,
  Material,
  Quotation,
  QuotationFullView,
  QuotationLine,
  Supplier,
  SupplierComparisonRow,
  SupplierOffer,
} from "@/types/db";

type OfferWithSupplier = SupplierOffer & { suppliers: Pick<Supplier, "name"> | null };

export async function getMaterials(): Promise<Material[]> {
  const { data, error } = await supabase.from("materials").select("*").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function getSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase.from("suppliers").select("*").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function getLocations(): Promise<Location[]> {
  const { data, error } = await supabase.from("locations").select("*").order("name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function getQuotations(): Promise<Quotation[]> {
  const { data, error } = await supabase.from("quotations").select("*").order("quotation_number", { ascending: false });
  if (error) throw new Error(error.message);
  return data;
}

export async function getQuotationById(id: string): Promise<Quotation | null> {
  const { data, error } = await supabase.from("quotations").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function createQuotation(payload: Omit<Quotation, "id">): Promise<Quotation> {
  const { data, error } = await supabase.from("quotations").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createQuotationLine(
  payload: Omit<QuotationLine, "id" | "unit_price" | "delivery_cost" | "total_line_cost">
): Promise<QuotationLine> {
  const { data, error } = await supabase.from("quotation_lines").insert(payload).select("*").single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getQuotationFullView(quotationId: string): Promise<QuotationFullView[]> {
  const { data, error } = await supabase
    .from("quotation_full_view")
    .select("*")
    .eq("quotation_id", quotationId)
    .order("material_name", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function getSupplierComparison(params: {
  materialId: string;
  locationId: string;
  quantity: number;
}): Promise<SupplierComparisonRow[]> {
  const { materialId, locationId, quantity } = params;

  const { data: offersData, error: offersError } = await supabase
    .from("supplier_offers")
    .select("id,supplier_id,material_id,unit_price,currency,suppliers(name)")
    .eq("material_id", materialId)
    .returns<OfferWithSupplier[]>();
  if (offersError) throw new Error(offersError.message);

  const supplierIds = offersData.map((offer) => offer.supplier_id);
  if (supplierIds.length === 0) return [];

  const { data: deliveryOptions, error: deliveryError } = await supabase
    .from("delivery_options")
    .select("*")
    .eq("location_id", locationId)
    .in("supplier_id", supplierIds)
    .returns<DeliveryOption[]>();
  if (deliveryError) throw new Error(deliveryError.message);

  const deliveryBySupplier = new Map<string, DeliveryOption>();
  deliveryOptions.forEach((option) => {
    deliveryBySupplier.set(option.supplier_id, option);
  });

  return offersData
    .map((offer) => {
      const delivery = deliveryBySupplier.get(offer.supplier_id);
      const deliveryCost = delivery ? delivery.delivery_cost : Number.POSITIVE_INFINITY;
      return {
        offer_id: offer.id,
        supplier_id: offer.supplier_id,
        supplier_name: offer.suppliers?.name ?? "Unknown supplier",
        unit_price: offer.unit_price,
        delivery_cost: deliveryCost,
        total_cost: offer.unit_price * quantity + deliveryCost,
        currency: offer.currency,
      };
    })
    .filter((row) => Number.isFinite(row.delivery_cost))
    .sort((a, b) => a.total_cost - b.total_cost);
}
