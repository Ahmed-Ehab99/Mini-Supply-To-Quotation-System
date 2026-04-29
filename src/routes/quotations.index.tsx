import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useDeleteQuotation, useQuotations } from "@/hooks/useQuotations";
import { useCustomers } from "@/hooks/useCustomers";
import { useLocations } from "@/hooks/useLocations";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/quotations/")({
  head: () => ({ meta: [{ title: "Quotations — SupplyQ" }] }),
  component: QuotationsListPage,
});

function QuotationsListPage() {
  const { data, isLoading } = useQuotations();
  const { data: customers } = useCustomers();
  const { data: locations } = useLocations();
  const del = useDeleteQuotation();

  const cMap = useMemo(
    () => new Map((customers ?? []).map((c) => [c.id, c])),
    [customers],
  );
  const lMap = useMemo(
    () => new Map((locations ?? []).map((l) => [l.id, l])),
    [locations],
  );

  return (
    <div>
      <PageHeader
        title="Quotations"
        description="All draft and sent quotations."
        actions={
          <Button asChild>
            <Link to="/quotations/new">
              <Plus className="mr-2 h-4 w-4" /> New Quotation
            </Link>
          </Button>
        }
      />
      <Card className="p-4">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No quotations yet"
            description="Create your first quotation to compare suppliers and price for your customer."
            action={{
              label: "New Quotation",
              onClick: () => {
                window.location.href = "/quotations/new";
              },
            }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((q) => (
                <TableRow
                  key={q.id}
                  className="cursor-pointer hover:bg-accent/40"
                >
                  <TableCell className="font-medium">
                    <Link to="/quotations/$id" params={{ id: q.id }}>
                      {q.reference_number}
                    </Link>
                  </TableCell>
                  <TableCell>{cMap.get(q.customer_id)?.name ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {lMap.get(q.destination_id)?.name ?? "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={q.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(q.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to="/quotations/$id" params={{ id: q.id }}>
                            Open
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/quotations/$id/edit" params={{ id: q.id }}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <ConfirmDialog
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          }
                          title="Delete this quotation?"
                          onConfirm={() => del.mutate(q.id)}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
