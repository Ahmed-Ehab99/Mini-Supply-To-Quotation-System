import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, MoreHorizontal, Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import {
  useDeleteOffer, useSupplierOffers, useUpdateOffer,
} from "@/hooks/useSupplierOffers";
import { useMaterials } from "@/hooks/useMaterials";
import { useSuppliers } from "@/hooks/useSuppliers";
import {
  supplierOfferSchema, type SupplierOfferFormValues,
} from "@/schemas/supplier-offer.schema";
import { formatDate } from "@/lib/format";
import type { OfferStatus, SupplierOffer } from "@/types";

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [{ title: "Supplier Offers — SupplyQ" }] }),
  component: SupplierOffersPage,
});

function SupplierOffersPage() {
  const { data: offers, isLoading } = useSupplierOffers();
  const { data: materials } = useMaterials();
  const { data: suppliers } = useSuppliers();
  const update = useUpdateOffer();
  const del = useDeleteOffer();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [matFilter, setMatFilter] = useState<string>("all");
  const [supFilter, setSupFilter] = useState<string>("all");
  const [editing, setEditing] = useState<SupplierOffer | null>(null);

  const matMap = useMemo(
    () => new Map((materials ?? []).map((m) => [m.id, m])),
    [materials],
  );
  const supMap = useMemo(
    () => new Map((suppliers ?? []).map((s) => [s.id, s])),
    [suppliers],
  );

  const filtered = (offers ?? []).filter((o) => {
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    if (matFilter !== "all" && o.material_id !== matFilter) return false;
    if (supFilter !== "all" && o.supplier_id !== supFilter) return false;
    return true;
  });

  const isExpiringSoon = (until: string | null) => {
    if (!until) return false;
    const d = new Date(until).getTime() - Date.now();
    return d > 0 && d < 14 * 24 * 60 * 60 * 1000;
  };

  return (
    <div>
      <PageHeader
        title="Supplier Offers"
        description="Active prices from your suppliers."
        actions={
          <Button asChild>
            <Link to="/offers/new"><Plus className="mr-2 h-4 w-4" /> New Offer</Link>
          </Button>
        }
      />

      <Card className="p-4">
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
          <Select value={matFilter} onValueChange={setMatFilter}>
            <SelectTrigger><SelectValue placeholder="Material" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All materials</SelectItem>
              {(materials ?? []).map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={supFilter} onValueChange={setSupFilter}>
            <SelectTrigger><SelectValue placeholder="Supplier" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All suppliers</SelectItem>
              {(suppliers ?? []).map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Tag}
            title="No offers"
            description="Create your first supplier offer."
            action={{ label: "New Offer", onClick: () => { window.location.href = "/offers/new"; } }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead>Valid from</TableHead>
                <TableHead>Valid until</TableHead>
                <TableHead>Status</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((o) => {
                const expiring = isExpiringSoon(o.valid_until);
                return (
                  <TableRow key={o.id} className={expiring ? "bg-amber-500/5" : ""}>
                    <TableCell className="font-medium">
                      {matMap.get(o.material_id)?.name ?? "—"}
                    </TableCell>
                    <TableCell>{supMap.get(o.supplier_id)?.name ?? "—"}</TableCell>
                    <TableCell className="text-right">
                      <PriceDisplay amount={Number(o.unit_price)} currency={o.currency} emphasize />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(o.valid_from)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        {expiring && <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />}
                        {formatDate(o.valid_until)}
                      </div>
                    </TableCell>
                    <TableCell><StatusBadge status={o.status} /></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditing(o)}>
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <ConfirmDialog
                            trigger={
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            }
                            title="Delete this offer?"
                            onConfirm={() => del.mutate(o.id)}
                          />
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <EditOfferSheet
        offer={editing}
        onClose={() => setEditing(null)}
        onSubmit={(values) => {
          if (!editing) return;
          update.mutate(
            {
              id: editing.id,
              data: {
                ...values,
                valid_until: values.valid_until || null,
                notes: values.notes || null,
              },
            },
            { onSuccess: () => setEditing(null) },
          );
        }}
      />
    </div>
  );
}

function EditOfferSheet({
  offer, onClose, onSubmit,
}: {
  offer: SupplierOffer | null;
  onClose: () => void;
  onSubmit: (v: SupplierOfferFormValues) => void;
}) {
  const form = useForm<SupplierOfferFormValues>({
    resolver: zodResolver(supplierOfferSchema),
    values: offer
      ? {
          material_id: offer.material_id,
          supplier_id: offer.supplier_id,
          unit_price: Number(offer.unit_price),
          currency: offer.currency,
          valid_from: offer.valid_from,
          valid_until: offer.valid_until ?? "",
          status: offer.status,
          notes: offer.notes ?? "",
        }
      : {
          material_id: "", supplier_id: "", unit_price: 0, currency: "USD",
          valid_from: "", valid_until: "", status: "active", notes: "",
        },
  });
  return (
    <Sheet open={!!offer} onOpenChange={(b) => !b && onClose()}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit offer</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Unit price</Label>
              <Input
                type="number" step="0.0001"
                {...form.register("unit_price", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input {...form.register("currency")} />
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
            </div>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={form.watch("status")}
              onValueChange={(v) => form.setValue("status", v as OfferStatus)}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
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
          <SheetFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
