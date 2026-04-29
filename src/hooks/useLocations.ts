import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createLocation,
  deleteLocation,
  getLocations,
  updateLocation,
} from "@/api/locations";
import { parseSupabaseError } from "@/lib/supabase-errors";
import type { LocationInsert } from "@/types";

export const LOCATIONS_KEY = ["locations"] as const;

export function useLocations() {
  return useQuery({ queryKey: LOCATIONS_KEY, queryFn: getLocations });
}

export function useCreateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createLocation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOCATIONS_KEY });
      toast.success("Location created");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useUpdateLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LocationInsert> }) =>
      updateLocation(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOCATIONS_KEY });
      toast.success("Location updated");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}

export function useDeleteLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLocation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: LOCATIONS_KEY });
      toast.success("Location deleted");
    },
    onError: (e) => toast.error(parseSupabaseError(e)),
  });
}
