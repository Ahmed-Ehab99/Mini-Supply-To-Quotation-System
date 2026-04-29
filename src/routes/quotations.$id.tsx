import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Pencil, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { PriceDisplay } from "@/components/shared/PriceDisplay";
import { PageLoader } from "@/components/shared/LoadingSpinner";
import { useQuotationDetail, useUpdateQuotation } from "@/hooks/useQuotations";
import { formatDate } from "@/lib/format";
import type { QuotationStatus } from "@/types";

export const Route = createFileRoute("/quotations/$id")({
  head: () => ({ meta: [{ title: "Quotation — SupplyQ" }] }),
  component: QuotationDetailPage,
});

function QuotationDetailPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuotationDetail(id);
  const update = useUpdateQuotation();

  if (isLoading || !data) return <PageLoader />;

  const subtotal = data.lines.reduce(
    (s, l) => s + Number(l.selling_price) * Number(l.quantity),
    0,
  );

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
              <Button asChild variant="outline">
                <Link to="/quotations/$id/edit" params={{ id: data.id }}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Link>
              </Button>
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
              <p className="text-base font-semibold">{data.destination.name}</p>
              <p className="text-sm text-muted-foreground">
                {data.destination.city}, {data.destination.country}
              </p>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Material</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Unit price</TableHead>
                <TableHead className="text-right">Line total</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={4} className="text-right font-semibold">
                  Subtotal
                </TableCell>
                <TableCell className="text-right text-base font-bold">
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
    </div>
  );
}
