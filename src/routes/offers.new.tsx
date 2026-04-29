import { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { ComboboxField } from "@/components/shared/ComboboxField";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { useMaterials } from "@/hooks/useMaterials";
import { useSuppliers } from "@/hooks/useSuppliers";
import { useCreateOffer } from "@/hooks/useSupplierOffers";
import {
  supplierOfferSchema,
  type SupplierOfferFormValues,
} from "@/schemas/supplier-offer.schema";
import { formatDate } from "@/lib/format";
import type { OfferStatus } from "@/types";

export const Route = createFileRoute("/offers/new")({
  head: () => ({ meta: [{ title: "New Offer — SupplyQ" }] }),
  component: SupplierOfferIntakePage,
});

function SupplierOfferIntakePage() {
  const navigate = useNavigate();
  const { data: materials } = useMaterials();
  const { data: suppliers } = useSuppliers();
  const create = useCreateOffer();

  const form = useForm<SupplierOfferFormValues>({
    resolver: zodResolver(supplierOfferSchema),
    defaultValues: {
      material_id: "",
      supplier_id: "",
      unit_price: 0,
      currency: "USD",
      valid_from: new Date().toISOString().slice(0, 10),
      valid_until: "",
      status: "active",
      notes: "",
    },
  });

  const watched = form.watch();
  const matName = useMemo(
    () => materials?.find((m) => m.id === watched.material_id)?.name,
    [materials, watched.material_id],
  );
  const supName = useMemo(
    () => suppliers?.find((s) => s.id === watched.supplier_id)?.name,
    [suppliers, watched.supplier_id],
  );

  const onSubmit = (values: SupplierOfferFormValues) => {
    create.mutate(
      {
        ...values,
        material_id: values.material_id || "",
        supplier_id: values.supplier_id || "",
        unit_price: values.unit_price || 0,
        currency: values.currency || "USD",
        valid_from: values.valid_from || new Date().toISOString().slice(0, 10),
        valid_until: values.valid_until || "",
        status: values.status || "active",
        notes: values.notes || "",
      },
      { onSuccess: () => navigate({ to: "/offers" }) },
    );
  };

  return (
    <div>
      <PageHeader
        title="New supplier offer"
        description="Capture a price from a supplier for a specific material."
        actions={
          <Button variant="outline" onClick={() => navigate({ to: "/offers" })}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Offer details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label>Material</Label>
                <ComboboxField
                  options={(materials ?? []).map((m) => ({
                    label: m.name,
                    value: m.id,
                    hint: m.unit,
                  }))}
                  value={watched.material_id}
                  onChange={(v) =>
                    form.setValue("material_id", v, { shouldValidate: true })
                  }
                  placeholder="Select a material"
                />
                {form.formState.errors.material_id && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.material_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <ComboboxField
                  options={(suppliers ?? []).map((s) => ({
                    label: s.name,
                    value: s.id,
                    hint: s.country ?? undefined,
                  }))}
                  value={watched.supplier_id}
                  onChange={(v) =>
                    form.setValue("supplier_id", v, { shouldValidate: true })
                  }
                  placeholder="Select a supplier"
                />
                {form.formState.errors.supplier_id && (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.supplier_id.message}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Unit price</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    {...form.register("unit_price", { valueAsNumber: true })}
                  />
                  {form.formState.errors.unit_price && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.unit_price.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input {...form.register("currency")} maxLength={3} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Valid from</Label>
                  <Input type="date" {...form.register("valid_from")} />
                </div>
                <div className="space-y-2">
                  <Label>Valid until</Label>
                  <Input type="date" {...form.register("valid_until")} />
                  {form.formState.errors.valid_until && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.valid_until.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={watched.status}
                  onValueChange={(v) =>
                    form.setValue("status", v as OfferStatus)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Textarea rows={3} {...form.register("notes")} />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/offers" })}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={create.isPending}>
                  Submit Offer
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Live preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg bg-accent/40 p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Tag className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Material
                </p>
                <p className="truncate font-medium">{matName ?? "—"}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Supplier
                </p>
                <p className="truncate font-medium">{supName ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Price
                </p>
                <p className="font-semibold">
                  <PriceDisplay
                    amount={Number(watched.unit_price) || 0}
                    currency={watched.currency || "USD"}
                  />
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Valid from
                </p>
                <p>{formatDate(watched.valid_from)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Valid until
                </p>
                <p>{formatDate(watched.valid_until)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
