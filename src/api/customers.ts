import { supabase } from "@/lib/supabase";
import type { Customer, CustomerInsert } from "@/types";

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from("customer").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createCustomer(data: CustomerInsert): Promise<Customer> {
  const { data: row, error } = await supabase
    .from("customer")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function updateCustomer(
  id: string,
  data: Partial<CustomerInsert>,
): Promise<Customer> {
  const { data: row, error } = await supabase
    .from("customer")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabase.from("customer").delete().eq("id", id);
  if (error) throw error;
}
