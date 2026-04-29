import { supabase } from "@/lib/supabase";
import type { Supplier, SupplierInsert } from "@/types";

export async function getSuppliers(): Promise<Supplier[]> {
  const { data, error } = await supabase
    .from("supplier")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getSupplierById(id: string): Promise<Supplier> {
  const { data, error } = await supabase
    .from("supplier")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createSupplier(data: SupplierInsert): Promise<Supplier> {
  const { data: row, error } = await supabase
    .from("supplier")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function updateSupplier(
  id: string,
  data: Partial<SupplierInsert>,
): Promise<Supplier> {
  const { data: row, error } = await supabase
    .from("supplier")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function deleteSupplier(id: string): Promise<void> {
  const { error } = await supabase.from("supplier").delete().eq("id", id);
  if (error) throw error;
}
