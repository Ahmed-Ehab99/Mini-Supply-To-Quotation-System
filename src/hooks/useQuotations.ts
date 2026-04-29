import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addQuotationLine,
  createQuotation,
  deleteQuotation,
  deleteQuotationLine,
  getQuotations,
  getQuotationWithDetails,
  updateQuotation,
  updateQuotationLine,
} from "@/api/quotations";
import { parseSupabaseError } from "@/lib/supabase-errors";
import type { QuotationInsert, QuotationLineInsert } from "@/types";

export const QUOTATIONS_KEY = ["quotations"] as const;
export const quotationDetailKey = (id: string) => ["quotation", id] as const;

export function useQuotations() {
  return useQuery({ queryKey: QUOTATIONS_KEY, queryFn: getQuotations });
}

export function useQuotationDetail(id: string | undefined) {
  return useQuery({
    queryKey: quotationDetailKey(id ?? ""),
    queryFn: () => getQuotationWithDetails(id!),
    enabled: !!id,
  });
}

export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createQuotation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUOTATIONS_KEY });
      toast.success("Quotation created");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useUpdateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<QuotationInsert>;
    }) => updateQuotation(id, data),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: QUOTATIONS_KEY });
      qc.invalidateQueries({ queryKey: quotationDetailKey(vars.id) });
      toast.success("Quotation updated");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useDeleteQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteQuotation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUOTATIONS_KEY });
      toast.success("Quotation deleted");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useAddQuotationLine(quotationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: QuotationLineInsert) => addQuotationLine(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotationDetailKey(quotationId) });
      toast.success("Line added");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useUpdateQuotationLine(quotationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<QuotationLineInsert>;
    }) => updateQuotationLine(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotationDetailKey(quotationId) });
      toast.success("Line updated");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useDeleteQuotationLine(quotationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteQuotationLine,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: quotationDetailKey(quotationId) });
      toast.success("Line removed");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}
