import { supabase } from "@/lib/supabase";
import type {
  Quotation,
  QuotationInsert,
  QuotationLine,
  QuotationLineInsert,
  QuotationWithDetails,
} from "@/types";

export async function getQuotations(): Promise<Quotation[]> {
  const { data, error } = await supabase
    .from("quotation")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getQuotationWithDetails(
  id: string,
): Promise<QuotationWithDetails> {
  const { data, error } = await supabase
    .from("quotation")
    .select(
      `*,
      customer:customer_id ( id, name, country ),
      destination:destination_id ( id, name, city, country ),
      lines:quotation_line (
        *,
        material:material_id ( id, name, unit ),
        selected_offer:selected_offer_id (
          *,
          supplier:supplier_id ( id, name )
        ),
        delivery_rate:delivery_rate_id ( id, cost_per_unit, incoterm )
      )`,
    )
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as unknown as QuotationWithDetails;
}

export async function createQuotation(
  data: QuotationInsert,
): Promise<Quotation> {
  const { data: row, error } = await supabase
    .from("quotation")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function updateQuotation(
  id: string,
  data: Partial<QuotationInsert>,
): Promise<Quotation> {
  const { data: row, error } = await supabase
    .from("quotation")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function deleteQuotation(id: string): Promise<void> {
  const { error } = await supabase.from("quotation").delete().eq("id", id);
  if (error) throw error;
}

export async function addQuotationLine(
  data: QuotationLineInsert,
): Promise<QuotationLine> {
  const { data: row, error } = await supabase
    .from("quotation_line")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function updateQuotationLine(
  id: string,
  data: Partial<QuotationLineInsert>,
): Promise<QuotationLine> {
  const { data: row, error } = await supabase
    .from("quotation_line")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return row;
}

export async function deleteQuotationLine(id: string): Promise<void> {
  const { error } = await supabase.from("quotation_line").delete().eq("id", id);
  if (error) throw error;
}
