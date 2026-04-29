import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from "@/api/suppliers";
import { parseSupabaseError } from "@/lib/supabase-errors";
import type { SupplierInsert } from "@/types";

export const SUPPLIERS_KEY = ["suppliers"] as const;

export function useSuppliers() {
  return useQuery({ queryKey: SUPPLIERS_KEY, queryFn: getSuppliers });
}

export function useCreateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSupplier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      toast.success("Supplier created");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useUpdateSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SupplierInsert> }) =>
      updateSupplier(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      toast.success("Supplier updated");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useDeleteSupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: SUPPLIERS_KEY });
      toast.success("Supplier deleted");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}
