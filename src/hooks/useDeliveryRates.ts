import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteDeliveryRate,
  getDeliveryRates,
  upsertDeliveryRate,
} from "@/api/delivery-rates";
import { parseSupabaseError } from "@/lib/supabase-errors";

export const RATES_KEY = ["delivery_rates"] as const;

export function useDeliveryRates() {
  return useQuery({ queryKey: RATES_KEY, queryFn: () => getDeliveryRates() });
}

export function useUpsertDeliveryRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: upsertDeliveryRate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RATES_KEY });
      toast.success("Delivery rate saved");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useDeleteDeliveryRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDeliveryRate,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RATES_KEY });
      toast.success("Delivery rate removed");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}
