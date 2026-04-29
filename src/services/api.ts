import type {
  APIResult,
  DeliveryCost,
  DeliveryLocation,
  Material,
  Quotation,
  Supplier,
  SupplierOffer,
} from "@/types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.warn(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env — API calls will fail."
  );
}

const baseHeaders: Record<string, string> = {
  apikey: SUPABASE_KEY ?? "",
  Authorization: `Bearer ${SUPABASE_KEY ?? ""}`,
  "Content-Type": "application/json",
};

async function fetchAPI<T>(
  path: string,
  options: RequestInit = {}
): Promise<APIResult<T>> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      ...options,
      headers: { ...baseHeaders, ...(options.headers ?? {}) },
    });
    if (!res.ok) {
      const text = await res.text();
      return { data: null, error: `${res.status}: ${text || res.statusText}` };
    }
    if (res.status === 204) {
      return { data: undefined as unknown as T, error: null };
    }
    const data = (await res.json()) as T;
    return { data, error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Network error";
    return { data: null, error: message };
  }
}

// READ
export const fetchMaterials = () =>
  fetchAPI<Material[]>("/materials?select=*&order=category.asc,name.asc");

export const fetchSuppliers = () =>
  fetchAPI<Supplier[]>("/suppliers?select=*&order=name.asc");

export const fetchAllOffers = () =>
  fetchAPI<SupplierOffer[]>("/supplier_offers?select=*");

export const fetchLocations = () =>
  fetchAPI<DeliveryLocation[]>("/delivery_locations?select=*&order=name.asc");

export const fetchAllDeliveryCosts = () =>
  fetchAPI<DeliveryCost[]>("/delivery_costs?select=*");

// WRITE
export interface CreateQuotationPayload {
  reference_number: string;
  customer_name: string | null;
  delivery_location_id: string;
  status?: string;
}

export interface CreateQuotationLinePayload {
  quotation_id: string;
  material_id: string;
  selected_offer_id: string;
  quantity: number;
  unit_price: number;
  delivery_cost: number;
  total_line_cost: number;
}

export const createQuotation = (payload: CreateQuotationPayload) =>
  fetchAPI<Quotation[]>("/quotations", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });

export const createQuotationLine = (payload: CreateQuotationLinePayload) =>
  fetchAPI<unknown[]>("/quotation_lines", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(payload),
  });
