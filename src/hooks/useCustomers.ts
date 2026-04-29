import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "@/api/customers";
import { parseSupabaseError } from "@/lib/supabase-errors";
import type { CustomerInsert } from "@/types";

export const CUSTOMERS_KEY = ["customers"] as const;

export function useCustomers() {
  return useQuery({ queryKey: CUSTOMERS_KEY, queryFn: getCustomers });
}

export function useCreateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      toast.success("Customer created");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useUpdateCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CustomerInsert> }) =>
      updateCustomer(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      toast.success("Customer updated");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useDeleteCustomer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CUSTOMERS_KEY });
      toast.success("Customer deleted");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}
