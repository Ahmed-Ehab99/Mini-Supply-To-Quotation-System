import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { ComboboxField } from "@/components/shared/ComboboxField";
import { ComparisonTable } from "@/components/shared/ComparisonTable";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { MarginBadge } from "@/components/shared/MarginBadge";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { useCustomers } from "@/hooks/useCustomers";
import { useLocations } from "@/hooks/useLocations";
import { useMaterials } from "@/hooks/useMaterials";
import { useSupplierComparison } from "@/hooks/useSupplierComparison";
import {
  useAddQuotationLine,
  useCreateQuotation,
  useDeleteQuotationLine,
  useQuotationDetail,
  useUpdateQuotation,
} from "@/hooks/useQuotations";
import {
  quotationSchema,
  type QuotationFormValues,
} from "@/schemas/quotation.schema";
import { generateQuotationRef } from "@/lib/format";
import type { SupplierOfferWithDetails } from "@/types";

export function QuotationBuilder({
  quotationId: initialId,
}: {
  quotationId?: string;
}) {
  const navigate = useNavigate();
  const [quotationId, setQuotationId] = useState<string | null>(
    initialId ?? null,
  );
  const [addOpen, setAddOpen] = useState(false);

  const { data: customers } = useCustomers();
  const { data: locations } = useLocations();
  const { data: detail, isLoading } = useQuotationDetail(
    quotationId ?? undefined,
  );

  const createQuot = useCreateQuotation();
  const updateQuot = useUpdateQuotation();
  const addLine = useAddQuotationLine(quotationId ?? "");
  const delLine = useDeleteQuotationLine(quotationId ?? "");

  const form = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      customer_id: "",
      destination_id: "",
      reference_number: generateQuotationRef(),
      valid_until: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (detail) {
      form.reset({
        customer_id: detail.customer_id,
        destination_id: detail.destination_id,
        reference_number: detail.reference_number,
        valid_until: detail.valid_until ?? "",
        notes: detail.notes ?? "",
      });
    }
  }, [detail, form]);

  const watched = useWatch({
    control: form.control,
  });
  const lines = useMemo(() => detail?.lines ?? [], [detail]);

  const totals = useMemo(() => {
    const totalCost = lines.reduce(
      (s, l) => s + Number(l.effective_price_snapshot) * Number(l.quantity),
      0,
    );
    const totalRevenue = lines.reduce(
      (s, l) => s + Number(l.selling_price) * Number(l.quantity),
      0,
    );
    const totalMargin =
      totalCost > 0 ? ((totalRevenue - totalCost) / totalCost) * 100 : 0;
    return { totalCost, totalRevenue, totalMargin };
  }, [lines]);

  const saveHeader = (values: QuotationFormValues) => {
    const payload: {
      customer_id: string;
      destination_id: string;
      reference_number: string;
      valid_until: string | null;
      notes: string | null;
    } = {
      customer_id: values.customer_id,
      destination_id: values.destination_id,
      reference_number: values.reference_number,
      valid_until: values.valid_until || null,
      notes: values.notes || null,
    };
    if (quotationId) {
      updateQuot.mutate({ id: quotationId, data: payload });
    } else {
      createQuot.mutate(payload, {
        onSuccess: (q) => setQuotationId(q.id),
      });
    }
  };

  if (initialId && isLoading) return <PageLoader />;

  return (
    <div>
      <PageHeader
        title={quotationId ? "Edit quotation" : "New quotation"}
        description="Set the destination, then add material lines and pick the best supplier per line."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          {/* Header form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quotation header</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(saveHeader)}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <div className="space-y-2 sm:col-span-2">
                  <Label>Reference number</Label>
                  <Input {...form.register("reference_number")} />
                </div>
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <ComboboxField
                    options={(customers ?? []).map((c) => ({
                      label: c.name,
                      value: c.id,
                    }))}
                    value={watched.customer_id}
                    onChange={(v) =>
                      form.setValue("customer_id", v, { shouldValidate: true })
                    }
                    placeholder="Select customer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    Destination{" "}
                    <span className="text-xs font-normal text-muted-foreground">
                      (drives supplier comparison)
                    </span>
                  </Label>
                  <ComboboxField
                    options={(locations ?? []).map((l) => ({
                      label: l.name,
                      value: l.id,
                      hint: `${l.city}, ${l.country}`,
                    }))}
                    value={watched.destination_id}
                    onChange={(v) =>
                      form.setValue("destination_id", v, {
                        shouldValidate: true,
                      })
                    }
                    placeholder="Select destination"
                    disabled={!!quotationId && lines.length > 0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid until</Label>
                  <Input type="date" {...form.register("valid_until")} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Notes</Label>
                  <Textarea rows={2} {...form.register("notes")} />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <Button
                    type="submit"
                    disabled={createQuot.isPending || updateQuot.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {quotationId ? "Save header" : "Create & continue"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Lines */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Material lines</CardTitle>
              <Button
                size="sm"
                onClick={() => setAddOpen(true)}
                disabled={!quotationId || !watched.destination_id}
              >
                <Plus className="mr-2 h-4 w-4" /> Add line
              </Button>
            </CardHeader>
            <CardContent>
              {!quotationId ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Save the header first to start adding lines.
                </p>
              ) : lines.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No lines yet. Click <strong>Add line</strong> to compare
                  suppliers and pick one.
                </p>
              ) : (
                <ul className="space-y-3">
                  {lines.map((l) => (
                    <li
                      key={l.id}
                      className="flex flex-col gap-2 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {l.material.name}
                          </span>
                          <Badge variant="outline">{l.material.unit}</Badge>
                          <MarginBadge marginPct={Number(l.margin_pct)} />
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          via <strong>{l.selected_offer.supplier.name}</strong>{" "}
                          · {Number(l.quantity)} ×{" "}
                          <PriceDisplay
                            amount={Number(l.effective_price_snapshot)}
                          />{" "}
                          eff.
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Sell @
                          </p>
                          <p className="font-semibold">
                            <PriceDisplay amount={Number(l.selling_price)} />
                          </p>
                        </div>
                        <ConfirmDialog
                          trigger={
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          }
                          title="Remove this line?"
                          onConfirm={() => delLine.mutate(l.id)}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="lg:col-span-2">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lines</span>
                  <span className="font-medium tabular-nums">
                    {lines.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total cost</span>
                  <PriceDisplay amount={totals.totalCost} />
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total revenue</span>
                  <PriceDisplay amount={totals.totalRevenue} emphasize />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-muted-foreground">Overall margin</span>
                  <MarginBadge marginPct={totals.totalMargin} />
                </div>
              </div>
              <div className="border-t pt-4">
                <Button
                  className="w-full"
                  disabled={!quotationId || lines.length === 0}
                  onClick={() => {
                    if (!quotationId) return;
                    updateQuot.mutate(
                      { id: quotationId, data: { status: "sent" } },
                      {
                        onSuccess: () =>
                          navigate({
                            to: "/quotations/$id",
                            params: { id: quotationId },
                          }),
                      },
                    );
                  }}
                >
                  Finalize quotation <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddLineDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        quotationId={quotationId}
        destinationId={watched.destination_id ?? ""}
        onAdded={() => setAddOpen(false)}
        addLine={addLine.mutate}
      />
    </div>
  );
}

function AddLineDialog({
  open,
  onOpenChange,
  quotationId,
  destinationId,
  onAdded,
  addLine,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  quotationId: string | null;
  destinationId: string;
  onAdded: () => void;
  addLine: (
    data: Parameters<ReturnType<typeof useAddQuotationLine>["mutate"]>[0],
  ) => void;
}) {
  const { data: materials } = useMaterials();
  const [materialId, setMaterialId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [selected, setSelected] = useState<SupplierOfferWithDetails | null>(
    null,
  );
  const [notes, setNotes] = useState("");

  const resetState = () => {
    setMaterialId("");
    setQuantity(1);
    setSellingPrice(0);
    setSelected(null);
    setNotes("");
  };

  const handleOpenChange = (value: boolean) => {
    if (!value) resetState();
    onOpenChange(value);
  };

  const { data: offers, isLoading } = useSupplierComparison(
    materialId || null,
    destinationId || null,
  );

  const margin =
    selected && sellingPrice > 0
      ? ((sellingPrice - selected.effective_price) / selected.effective_price) *
        100
      : 0;

  const canSave =
    !!quotationId && !!selected && quantity > 0 && sellingPrice > 0;

  const handleSave = () => {
    if (!quotationId || !selected) return;
    addLine({
      quotation_id: quotationId,
      material_id: selected.material_id,
      selected_offer_id: selected.id,
      delivery_rate_id: selected.delivery_rate?.id ?? null,
      quantity,
      unit_price_snapshot: Number(selected.unit_price),
      delivery_cost_snapshot: selected.delivery_rate?.cost_per_unit ?? 0,
      effective_price_snapshot: selected.effective_price,
      selling_price: sellingPrice,
      margin_pct: margin,
      selection_notes: notes || null,
    });
    onAdded();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Add material line</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Material</Label>
              <ComboboxField
                options={(materials ?? []).map((m) => ({
                  label: m.name,
                  value: m.id,
                  hint: m.unit,
                }))}
                value={materialId}
                onChange={(v) => {
                  setMaterialId(v);
                  setSelected(null);
                }}
                placeholder="Select material"
              />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="0"
                step="0.0001"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>
          </div>

          {materialId && (
            <div className="space-y-2">
              <Label>Supplier comparison (sorted by effective price)</Label>
              {isLoading ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Loading…
                </p>
              ) : (
                <ComparisonTable
                  offers={offers ?? []}
                  selectedOfferId={selected?.id}
                  onSelect={setSelected}
                />
              )}
            </div>
          )}

          {selected && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Selling price (per unit)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={sellingPrice || ""}
                  onChange={(e) => setSellingPrice(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Cost: <PriceDisplay amount={selected.effective_price} /> ·
                  Margin:{" "}
                  <span
                    className={
                      margin >= 20
                        ? "font-semibold text-emerald-700"
                        : margin >= 10
                          ? "font-semibold text-amber-700"
                          : "font-semibold text-rose-700"
                    }
                  >
                    {margin.toFixed(1)}%
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <Label>Selection notes</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            <Check className="mr-2 h-4 w-4" /> Add to quotation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
