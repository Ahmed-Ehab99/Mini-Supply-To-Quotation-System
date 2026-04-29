import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createMaterial,
  deleteMaterial,
  getMaterials,
  updateMaterial,
} from "@/api/materials";
import { parseSupabaseError } from "@/lib/supabase-errors";
import type { MaterialInsert } from "@/types";

export const MATERIALS_KEY = ["materials"] as const;

export function useMaterials() {
  return useQuery({ queryKey: MATERIALS_KEY, queryFn: getMaterials });
}

export function useCreateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MATERIALS_KEY });
      toast.success("Material created");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useUpdateMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MaterialInsert> }) =>
      updateMaterial(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MATERIALS_KEY });
      toast.success("Material updated");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useDeleteMaterial() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMaterial,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MATERIALS_KEY });
      toast.success("Material deleted");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}
