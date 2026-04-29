import { supabase } from "@/lib/supabase";
import type { Material, MaterialInsert } from "@/types";

export async function getMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from("material")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getMaterialById(id: string): Promise<Material> {
  const { data, error } = await supabase
    .from("material")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createMaterial(data: MaterialInsert): Promise<Material> {
  const { data: row, error } = await supabase
    .from("material")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function updateMaterial(
  id: string,
  data: Partial<MaterialInsert>,
): Promise<Material> {
  const { data: row, error } = await supabase
    .from("material")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function deleteMaterial(id: string): Promise<void> {
  const { error } = await supabase.from("material").delete().eq("id", id);
  if (error) throw error;
}
