import { useQuery } from "@tanstack/react-query";
import { getSupplierComparison } from "@/api/comparison";

export function useSupplierComparison(
  materialId: string | null,
  destinationId: string | null,
) {
  return useQuery({
    queryKey: ["comparison", materialId, destinationId],
    queryFn: () => getSupplierComparison(materialId!, destinationId!),
    enabled: !!materialId && !!destinationId,
    staleTime: 30_000,
  });
}
