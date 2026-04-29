export type MaterialUnit =
  | "kg"
  | "ton"
  | "unit"
  | "meter"
  | "liter"
  | "m2"
  | "m3";
export type MaterialCategory =
  | "raw_material"
  | "component"
  | "consumable"
  | "equipment"
  | "packaging";
export type OfferStatus = "active" | "expired" | "withdrawn";
export type QuotationStatus =
  | "draft"
  | "sent"
  | "accepted"
  | "rejected"
  | "cancelled";
export type IncotermType =
  | "EXW"
  | "FCA"
  | "CPT"
  | "CIP"
  | "DAP"
  | "DPU"
  | "DDP"
  | "FAS"
  | "FOB"
  | "CFR"
  | "CIF";

export interface Database {
  public: {
    Tables: {
      material: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          unit: MaterialUnit;
          category: MaterialCategory;
          created_at: string;
        };
        Insert: {
          id?: string;
          name?: string;
          description?: string | null;
          unit?: MaterialUnit;
          category?: MaterialCategory;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["material"]["Insert"]>;
        Relationships: [];
      };
      supplier: {
        Row: {
          id: string;
          name: string;
          contact_email: string | null;
          country: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_email?: string | null;
          country?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["supplier"]["Insert"]>;
        Relationships: [];
      };
      location: {
        Row: {
          id: string;
          name: string;
          city: string;
          country: string;
          zone_code: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          city: string;
          country: string;
          zone_code?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["location"]["Insert"]>;
        Relationships: [];
      };
      customer: {
        Row: {
          id: string;
          name: string;
          contact_email: string | null;
          country: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_email?: string | null;
          country?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["customer"]["Insert"]>;
        Relationships: [];
      };
      supplier_offer: {
        Row: {
          id: string;
          material_id: string;
          supplier_id: string;
          unit_price: number;
          currency: string;
          valid_from: string;
          valid_until: string | null;
          status: OfferStatus;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          material_id: string;
          supplier_id: string;
          unit_price: number;
          currency?: string;
          valid_from: string;
          valid_until?: string | null;
          status?: OfferStatus;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["supplier_offer"]["Insert"]
        >;
        Relationships: [];
      };
      delivery_rate: {
        Row: {
          id: string;
          supplier_id: string;
          location_id: string;
          cost_per_unit: number;
          lead_time_days: number | null;
          incoterm: IncotermType | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          supplier_id: string;
          location_id: string;
          cost_per_unit: number;
          lead_time_days?: number | null;
          incoterm?: IncotermType | null;
          notes?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["delivery_rate"]["Insert"]
        >;
        Relationships: [];
      };
      quotation: {
        Row: {
          id: string;
          customer_id: string;
          destination_id: string;
          reference_number: string;
          status: QuotationStatus;
          valid_until: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          destination_id: string;
          reference_number: string;
          status?: QuotationStatus;
          valid_until?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["quotation"]["Insert"]>;
        Relationships: [];
      };
      quotation_line: {
        Row: {
          id: string;
          quotation_id: string;
          material_id: string;
          selected_offer_id: string;
          delivery_rate_id: string | null;
          quantity: number;
          unit_price_snapshot: number;
          delivery_cost_snapshot: number;
          effective_price_snapshot: number;
          selling_price: number;
          margin_pct: number;
          selection_notes: string | null;
        };
        Insert: {
          id?: string;
          quotation_id: string;
          material_id: string;
          selected_offer_id: string;
          delivery_rate_id?: string | null;
          quantity: number;
          unit_price_snapshot: number;
          delivery_cost_snapshot: number;
          effective_price_snapshot: number;
          selling_price: number;
          margin_pct: number;
          selection_notes?: string | null;
        };
        Update: Partial<
          Database["public"]["Tables"]["quotation_line"]["Insert"]
        >;
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: {
      material_unit: MaterialUnit;
      material_category: MaterialCategory;
      offer_status: OfferStatus;
      quotation_status: QuotationStatus;
      incoterm_type: IncotermType;
    };
    CompositeTypes: { [_ in never]: never };
  };
}
