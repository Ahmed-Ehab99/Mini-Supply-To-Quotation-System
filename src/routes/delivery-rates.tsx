import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import {
  useDeleteDeliveryRate,
  useDeliveryRates,
  useUpsertDeliveryRate,
} from "@/hooks/useDeliveryRates";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useLocations } from "@/hooks/useLocations";
import {
  deliveryRateSchema,
  type DeliveryRateFormValues,
} from "@/schemas/delivery-rate.schema";
import type { DeliveryRate, IncotermType } from "@/types";

export const Route = createFileRoute("/delivery-rates")({
  head: () => ({ meta: [{ title: "Delivery Rates — SupplyQ" }] }),
  component: DeliveryRatesPage,
});

const INCOTERMS: IncotermType[] = [
  "EXW",
  "FCA",
  "CPT",
  "CIP",
  "DAP",
  "DPU",
  "DDP",
  "FAS",
  "FOB",
  "CFR",
  "CIF",
];

interface CellState {
  supplierId: string;
  supplierName: string;
  locationId: string;
  locationName: string;
  rate: DeliveryRate | null;
}

function DeliveryRatesPage() {
  const { data: suppliers } = useSuppliers();
  const { data: locations } = useLocations();
  const { data: rates, isLoading } = useDeliveryRates();
  const upsert = useUpsertDeliveryRate();
  const del = useDeleteDeliveryRate();

  const [cell, setCell] = useState<CellState | null>(null);

  const rateMap = useMemo(() => {
    const m = new Map<string, DeliveryRate>();
    (rates ?? []).forEach((r) => m.set(`${r.supplier_id}:${r.location_id}`, r));
    return m;
  }, [rates]);

  const noData =
    (suppliers?.length ?? 0) === 0 || (locations?.length ?? 0) === 0;

  return (
    <div>
      <PageHeader
        title="Delivery Rates"
        description="Cost per unit to ship from each supplier to each destination. Empty cells = no rate on file."
      />
      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      ) : noData ? (
        <EmptyState
          icon={Truck}
          title="Add suppliers and locations first"
          description="Once you have at least one supplier and one location, the matrix will show editable cells."
        />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="sticky left-0 z-10 bg-muted/40 p-3 text-left font-medium">
                  Supplier ↓ / Destination →
                </th>
                {(locations ?? []).map((l) => (
                  <th
                    key={l.id}
                    className="min-w-[140px] p-3 text-left font-medium"
                  >
                    <div className="truncate">{l.name}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {l.city}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(suppliers ?? []).map((s) => (
                <tr key={s.id} className="border-b">
                  <td className="sticky left-0 z-10 bg-card p-3 font-medium">
                    {s.name}
                  </td>
                  {(locations ?? []).map((l) => {
                    const r = rateMap.get(`${s.id}:${l.id}`) ?? null;
                    return (
                      <td key={l.id} className="p-2">
                        <button
                          onClick={() =>
                            setCell({
                              supplierId: s.id,
                              supplierName: s.name,
                              locationId: l.id,
                              locationName: l.name,
                              rate: r,
                            })
                          }
                          className={`w-full rounded-md px-3 py-2 text-left transition-colors ${
                            r
                              ? "bg-emerald-500/10 hover:bg-emerald-500/20"
                              : "border border-dashed border-border text-muted-foreground hover:bg-accent"
                          }`}
                        >
                          {r ? (
                            <>
                              <div className="font-medium text-foreground">
                                <PriceDisplay
                                  amount={Number(r.cost_per_unit)}
                                />
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {r.incoterm ?? ""}
                                {r.lead_time_days
                                  ? ` · ${r.lead_time_days}d`
                                  : ""}
                              </div>
                            </>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs">
                              <Plus className="h-3 w-3" /> Add rate
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <RateSheet
        cell={cell}
        onClose={() => setCell(null)}
        onSubmit={(v) => {
          if (!cell) return;
          upsert.mutate(
            {
              supplier_id: cell.supplierId,
              location_id: cell.locationId,
              cost_per_unit: v.cost_per_unit,
              lead_time_days: v.lead_time_days ?? null,
              incoterm: v.incoterm ?? null,
              notes: v.notes || null,
            },
            { onSuccess: () => setCell(null) },
          );
        }}
        onDelete={(id) => del.mutate(id, { onSuccess: () => setCell(null) })}
      />
    </div>
  );
}

function RateSheet({
  cell,
  onClose,
  onSubmit,
  onDelete,
}: {
  cell: CellState | null;
  onClose: () => void;
  onSubmit: (v: DeliveryRateFormValues) => void;
  onDelete: (id: string) => void;
}) {
  const form = useForm<DeliveryRateFormValues>({
    resolver: zodResolver(deliveryRateSchema),
    values: cell
      ? {
          supplier_id: cell.supplierId,
          location_id: cell.locationId,
          cost_per_unit: cell.rate ? Number(cell.rate.cost_per_unit) : 0,
          lead_time_days: cell.rate?.lead_time_days ?? undefined,
          incoterm: cell.rate?.incoterm ?? undefined,
          notes: cell.rate?.notes ?? "",
        }
      : {
          supplier_id: "",
          location_id: "",
          cost_per_unit: 0,
          lead_time_days: undefined,
          incoterm: undefined,
          notes: "",
        },
  });

  return (
    <Sheet open={!!cell} onOpenChange={(b) => !b && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Delivery rate</SheetTitle>
          {cell && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {cell.supplierName}
              </span>{" "}
              →{" "}
              <span className="font-medium text-foreground">
                {cell.locationName}
              </span>
            </p>
          )}
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
          <div className="space-y-2">
            <Label>Cost per unit</Label>
            <Input
              type="number"
              step="0.0001"
              min="0"
              {...form.register("cost_per_unit", { valueAsNumber: true })}
            />
            {form.formState.errors.cost_per_unit && (
              <p className="text-xs text-destructive">
                {form.formState.errors.cost_per_unit.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Lead time (days)</Label>
              <Input
                type="number"
                min="1"
                {...form.register("lead_time_days", {
                  valueAsNumber: true,
                  setValueAs: (v) =>
                    v === "" || Number.isNaN(v) ? undefined : Number(v),
                })}
              />
            </div>
            <div className="space-y-2">
              <Label>Incoterm</Label>
              <Select
                value={form.watch("incoterm") ?? ""}
                onValueChange={(v) =>
                  form.setValue("incoterm", v as IncotermType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="—" />
                </SelectTrigger>
                <SelectContent>
                  {INCOTERMS.map((i) => (
                    <SelectItem key={i} value={i}>
                      {i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={3} {...form.register("notes")} />
          </div>
          <SheetFooter className="flex-col sm:flex-row sm:justify-between">
            {cell?.rate && (
              <ConfirmDialog
                trigger={
                  <Button
                    type="button"
                    variant="outline"
                    className="text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete rate
                  </Button>
                }
                title="Delete this delivery rate?"
                onConfirm={() => cell.rate && onDelete(cell.rate.id)}
              />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
