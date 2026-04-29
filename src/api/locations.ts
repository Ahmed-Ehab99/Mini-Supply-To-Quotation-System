import { supabase } from "@/lib/supabase";
import type { Location, LocationInsert } from "@/types";

export async function getLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from("location")
    .select("*")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createLocation(data: LocationInsert): Promise<Location> {
  const { data: row, error } = await supabase
    .from("location")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function updateLocation(
  id: string,
  data: Partial<LocationInsert>,
): Promise<Location> {
  const { data: row, error } = await supabase
    .from("location")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function deleteLocation(id: string): Promise<void> {
  const { error } = await supabase.from("location").delete().eq("id", id);
  if (error) throw error;
}
