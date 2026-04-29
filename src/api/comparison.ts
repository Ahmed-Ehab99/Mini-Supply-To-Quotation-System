import { supabase } from "@/lib/supabase";
import type {
  IncotermType,
  SupplierOffer,
  SupplierOfferWithDetails,
} from "@/types";

interface OfferJoinRow extends SupplierOffer {
  supplier: { id: string; name: string; country: string | null };
  material: { id: string; name: string; unit: string };
}

interface RateRow {
  id: string;
  supplier_id: string;
  cost_per_unit: number;
  lead_time_days: number | null;
  incoterm: IncotermType | null;
}

export async function getSupplierComparison(
  materialId: string,
  destinationId: string,
): Promise<SupplierOfferWithDetails[]> {
  const { data: offers, error } = await supabase
    .from("supplier_offer")
    .select(
      `*,
      supplier:supplier_id ( id, name, country ),
      material:material_id ( id, name, unit )`,
    )
    .eq("material_id", materialId)
    .eq("status", "active");
  if (error) throw error;

  const rows = (offers ?? []) as unknown as OfferJoinRow[];
  const supplierIds = rows.map((o) => o.supplier_id);
  if (supplierIds.length === 0) return [];

  const { data: rates, error: rateErr } = await supabase
    .from("delivery_rate")
    .select("id, supplier_id, cost_per_unit, lead_time_days, incoterm")
    .eq("location_id", destinationId)
    .in("supplier_id", supplierIds);
  if (rateErr) throw rateErr;

  const rateRows = (rates ?? []) as unknown as RateRow[];
  const rateMap = new Map<string, RateRow>(
    rateRows.map((r) => [r.supplier_id, r]),
  );

  const enriched: SupplierOfferWithDetails[] = rows.map((o) => {
    const rate = rateMap.get(o.supplier_id) ?? null;
    const deliveryCost = rate ? Number(rate.cost_per_unit) : 0;
    return {
      ...o,
      material: {
        id: o.material.id,
        name: o.material.name,
        unit: o.material.unit as SupplierOfferWithDetails["material"]["unit"],
      },
      delivery_rate: rate
        ? {
            id: rate.id,
            cost_per_unit: Number(rate.cost_per_unit),
            lead_time_days: rate.lead_time_days,
            incoterm: rate.incoterm,
          }
        : null,
      effective_price: Number(o.unit_price) + deliveryCost,
    };
  });

  enriched.sort((a, b) => a.effective_price - b.effective_price);
  return enriched;
}
