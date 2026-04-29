import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createOffer,
  deleteOffer,
  getOffers,
  updateOffer,
  type OfferFilters,
} from "@/api/supplier-offers";
import { parseSupabaseError } from "@/lib/supabase-errors";
import type { SupplierOfferInsert } from "@/types";

export const OFFERS_KEY = ["supplier_offers"] as const;

export function useSupplierOffers(filters?: OfferFilters) {
  return useQuery({
    queryKey: [...OFFERS_KEY, filters ?? {}],
    queryFn: () => getOffers(filters),
  });
}

export function useCreateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OFFERS_KEY });
      toast.success("Offer created");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useUpdateOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<SupplierOfferInsert>;
    }) => updateOffer(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OFFERS_KEY });
      toast.success("Offer updated");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useDeleteOffer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOffer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OFFERS_KEY });
      toast.success("Offer deleted");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}
