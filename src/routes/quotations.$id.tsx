import { ComboboxField } from "@/components/shared/ComboboxField";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCustomers } from "@/hooks/useCustomers";
import { useLocations } from "@/hooks/useLocations";
import {
  useQuotationDetail,
  useUpdateQuotation,
  useUpdateQuotationLine,
} from "@/hooks/useQuotations";
import { formatDate } from "@/lib/format";
import type { QuotationLineWithDetails, QuotationStatus } from "@/types";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Printer, Save, X } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/quotations/$id")({
  head: () => ({ meta: [{ title: "Quotation — SupplyQ" }] }),
  component: QuotationDetailPage,
});

function QuotationDetailPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuotationDetail(id);
  const update = useUpdateQuotation();
  const updateLine = useUpdateQuotationLine(id);
  const { data: customers } = useCustomers();
  const { data: locations } = useLocations();

  const [editingHeader, setEditingHeader] = useState(false);
  const [headerDraft, setHeaderDraft] = useState({
    reference_number: "",
    customer_id: "",
    destination_id: "",
    valid_until: "",
    notes: "",
  });

  const [editingLineData, setEditingLineData] =
    useState<QuotationLineWithDetails | null>(null);
  const [lineQuantity, setLineQuantity] = useState(0);
  const [lineSellingPrice, setLineSellingPrice] = useState(0);

  if (isLoading || !data) return <PageLoader />;

  const subtotal = data.lines.reduce(
    (s, l) => s + Number(l.selling_price) * Number(l.quantity),
    0,
  );

  const startEditHeader = () => {
    setHeaderDraft({
      reference_number: data.reference_number,
      customer_id: data.customer_id,
      destination_id: data.destination_id,
      valid_until: data.valid_until ?? "",
      notes: data.notes ?? "",
    });
    setEditingHeader(true);
  };

  const saveHeader = () => {
    update.mutate(
      {
        id: data.id,
        data: {
          reference_number: headerDraft.reference_number,
          customer_id: headerDraft.customer_id,
          destination_id: headerDraft.destination_id,
          valid_until: headerDraft.valid_until || null,
          notes: headerDraft.notes || null,
        },
      },
      { onSuccess: () => setEditingHeader(false) },
    );
  };

  const startEditLine = (l: QuotationLineWithDetails) => {
    setEditingLineData(l);
    setLineQuantity(Number(l.quantity));
    setLineSellingPrice(Number(l.selling_price));
  };

  const saveLineEdit = () => {
    if (!editingLineData) return;
    const effectivePrice = Number(editingLineData.effective_price_snapshot);
    const margin =
      effectivePrice > 0
        ? ((lineSellingPrice - effectivePrice) / effectivePrice) * 100
        : 0;
    updateLine.mutate(
      {
        id: editingLineData.id,
        data: {
          quantity: lineQuantity,
          selling_price: lineSellingPrice,
          margin_pct: margin,
        },
      },
      { onSuccess: () => setEditingLineData(null) },
    );
  };

  return (
    <div>
      <div className="print:hidden">
        <PageHeader
          title={`Quotation ${data.reference_number}`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={data.status}
                onValueChange={(v) =>
                  update.mutate({
                    id: data.id,
                    data: { status: v as QuotationStatus },
                  })
                }
              >
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => window.print()}>
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
              <Button asChild variant="ghost">
                <Link to="/quotations">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Link>
              </Button>
            </div>
          }
        />
      </div>

      <Card className="rounded-xl">
        <CardContent className="p-8">
          {/* Header section */}
          <div className="mb-8 flex items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <span className="text-lg font-bold">S</span>
                </div>
                <div>
                  <p className="text-lg font-bold tracking-tight">SupplyQ</p>
                  <p className="text-xs text-muted-foreground">
                    Commercial Quotation
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right text-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Reference
              </p>
              <p className="text-base font-semibold">{data.reference_number}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Issued {formatDate(data.created_at)}
              </p>
              {data.valid_until && (
                <p className="text-xs text-muted-foreground">
                  Valid until {formatDate(data.valid_until)}
                </p>
              )}
              <div className="mt-2 flex justify-end print:hidden">
                <StatusBadge status={data.status} />
              </div>
            </div>
          </div>

          {/* Editable info section */}
          {editingHeader ? (
            <div className="mb-8 space-y-4 rounded-lg border border-border p-4 print:hidden">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Reference number</Label>
                  <Input
                    value={headerDraft.reference_number}
                    onChange={(e) =>
                      setHeaderDraft((d) => ({
                        ...d,
                        reference_number: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <ComboboxField
                    options={(customers ?? []).map((c) => ({
                      label: c.name,
                      value: c.id,
                    }))}
                    value={headerDraft.customer_id}
                    onChange={(v) =>
                      setHeaderDraft((d) => ({ ...d, customer_id: v }))
                    }
                    placeholder="Select customer"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Destination</Label>
                  <ComboboxField
                    options={(locations ?? []).map((l) => ({
                      label: l.name,
                      value: l.id,
                      hint: `${l.city}, ${l.country}`,
                    }))}
                    value={headerDraft.destination_id}
                    onChange={(v) =>
                      setHeaderDraft((d) => ({ ...d, destination_id: v }))
                    }
                    placeholder="Select destination"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valid until</Label>
                  <Input
                    type="date"
                    value={headerDraft.valid_until}
                    onChange={(e) =>
                      setHeaderDraft((d) => ({
                        ...d,
                        valid_until: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    rows={2}
                    value={headerDraft.notes}
                    onChange={(e) =>
                      setHeaderDraft((d) => ({ ...d, notes: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingHeader(false)}
                >
                  <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={saveHeader}
                  disabled={update.isPending}
                >
                  <Save className="mr-2 h-4 w-4" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Customer
                </p>
                <p className="text-base font-semibold">{data.customer.name}</p>
                {data.customer.country && (
                  <p className="text-sm text-muted-foreground">
                    {data.customer.country}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Delivery to
                </p>
                <p className="text-base font-semibold">
                  {data.destination.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {data.destination.city}, {data.destination.country}
                </p>
              </div>
              <div className="sm:col-span-2 print:hidden">
                <Button variant="outline" size="sm" onClick={startEditHeader}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit details
                </Button>
              </div>
            </div>
          )}

          {/* Lines table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Line total</TableHead>
                <TableHead className="w-10 print:hidden" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.lines.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">
                    {l.material.name}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {l.material.unit}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {Number(l.quantity)}
                  </TableCell>
                  <TableCell className="text-right">
                    <PriceDisplay amount={Number(l.selling_price)} />
                  </TableCell>
                  <TableCell className="text-right">
                    <PriceDisplay
                      amount={Number(l.selling_price) * Number(l.quantity)}
                      emphasize
                    />
                  </TableCell>
                  <TableCell className="print:hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditLine(l)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={5} className="text-right font-semibold">
                  Subtotal
                </TableCell>
                <TableCell className="text-right text-base font-bold print:hidden">
                  <PriceDisplay amount={subtotal} emphasize />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          {data.notes && (
            <div className="mt-6 rounded-lg bg-muted/40 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Notes
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{data.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit line dialog */}
      <Dialog
        open={!!editingLineData}
        onOpenChange={(open) => {
          if (!open) setEditingLineData(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Edit line — {editingLineData?.material.name}
            </DialogTitle>
          </DialogHeader>
          {editingLineData && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={lineQuantity}
                  onChange={(e) => setLineQuantity(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label>Selling price (per unit)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.0001"
                  value={lineSellingPrice || ""}
                  onChange={(e) => setLineSellingPrice(Number(e.target.value))}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLineData(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveLineEdit}
              disabled={
                lineQuantity <= 0 ||
                lineSellingPrice <= 0 ||
                updateLine.isPending
              }
            >
              <Save className="mr-2 h-4 w-4" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
