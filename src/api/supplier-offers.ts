import { supabase } from "@/lib/supabase";
import type { OfferStatus, SupplierOffer, SupplierOfferInsert } from "@/types";

export interface OfferFilters {
  material_id?: string;
  supplier_id?: string;
  status?: OfferStatus;
}

export async function getOffers(filters?: OfferFilters): Promise<SupplierOffer[]> {
  let q = supabase
    .from("supplier_offer")
    .select("*")
    .order("created_at", { ascending: false });
  if (filters?.material_id) q = q.eq("material_id", filters.material_id);
  if (filters?.supplier_id) q = q.eq("supplier_id", filters.supplier_id);
  if (filters?.status) q = q.eq("status", filters.status);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getOffersForMaterial(materialId: string): Promise<SupplierOffer[]> {
  const { data, error } = await supabase
    .from("supplier_offer")
    .select("*")
    .eq("material_id", materialId)
    .eq("status", "active");
  if (error) throw error;
  return data ?? [];
}

export async function createOffer(data: SupplierOfferInsert): Promise<SupplierOffer> {
  const { data: row, error } = await supabase
    .from("supplier_offer")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function updateOffer(
  id: string,
  data: Partial<SupplierOfferInsert>,
): Promise<SupplierOffer> {
  const { data: row, error } = await supabase
    .from("supplier_offer")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function deleteOffer(id: string): Promise<void> {
  const { error } = await supabase.from("supplier_offer").delete().eq("id", id);
  if (error) throw error;
}
