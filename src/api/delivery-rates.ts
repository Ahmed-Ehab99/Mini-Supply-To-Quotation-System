import { supabase } from "@/lib/supabase";
import type { DeliveryRate, DeliveryRateInsert } from "@/types";

export interface DeliveryRateFilters {
  supplier_id?: string;
  location_id?: string;
}

export async function getDeliveryRates(
  filters?: DeliveryRateFilters,
): Promise<DeliveryRate[]> {
  let q = supabase.from("delivery_rate").select("*");
  if (filters?.supplier_id) q = q.eq("supplier_id", filters.supplier_id);
  if (filters?.location_id) q = q.eq("location_id", filters.location_id);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getDeliveryRateForSupplierLocation(
  supplierId: string,
  locationId: string,
): Promise<DeliveryRate | null> {
  const { data, error } = await supabase
    .from("delivery_rate")
    .select("*")
    .eq("supplier_id", supplierId)
    .eq("location_id", locationId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function upsertDeliveryRate(
  data: DeliveryRateInsert,
): Promise<DeliveryRate> {
  const { data: row, error } = await supabase
    .from("delivery_rate")
    .upsert(data, { onConflict: "supplier_id,location_id" })
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function deleteDeliveryRate(id: string): Promise<void> {
  const { error } = await supabase.from("delivery_rate").delete().eq("id", id);
  if (error) throw error;
}
