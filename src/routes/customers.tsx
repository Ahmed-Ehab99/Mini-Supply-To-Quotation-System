import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MoreHorizontal, Pencil, Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useCreateCustomer, useCustomers, useDeleteCustomer, useUpdateCustomer,
} from "@/hooks/useCustomers";
import { useQuotations } from "@/hooks/useQuotations";
import { customerSchema, type CustomerFormValues } from "@/schemas/customer.schema";
import type { Customer } from "@/types";

export const Route = createFileRoute("/customers")({
  head: () => ({ meta: [{ title: "Customers — SupplyQ" }] }),
  component: CustomersPage,
});

function CustomersPage() {
  const { data, isLoading } = useCustomers();
  const { data: quotations } = useQuotations();
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const del = useDeleteCustomer();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  const counts = (quotations ?? []).reduce<Record<string, number>>((acc, q) => {
    acc[q.customer_id] = (acc[q.customer_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Companies you sell quotations to."
        actions={
          <Button onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Customer
          </Button>
        }
      />
      <Card className="p-4">
        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : !data || data.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No customers yet"
            description="Add a customer to start sending quotations."
            action={{ label: "Add Customer", onClick: () => setOpen(true) }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Quotations</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.country ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{c.contact_email ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{counts[c.id] ?? 0}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => { setEditing(c); setOpen(true); }}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <ConfirmDialog
                          trigger={
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          }
                          title={`Delete "${c.name}"?`}
                          onConfirm={() => del.mutate(c.id)}
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

      <CustomerSheet
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSubmit={(v) => {
          const payload = {
            name: v.name,
            contact_email: v.contact_email || null,
            country: v.country || null,
          };
          if (editing) {
            update.mutate({ id: editing.id, data: payload }, { onSuccess: () => setOpen(false) });
          } else {
            create.mutate(payload, { onSuccess: () => setOpen(false) });
          }
        }}
      />
    </div>
  );
}

function CustomerSheet({
  open, onOpenChange, editing, onSubmit,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editing: Customer | null;
  onSubmit: (v: CustomerFormValues) => void;
}) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    values: editing
      ? { name: editing.name, contact_email: editing.contact_email ?? "", country: editing.country ?? "" }
      : { name: "", contact_email: "", country: "" },
  });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? "Edit customer" : "New customer"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" {...form.register("contact_email")} />
            {form.formState.errors.contact_email && (
              <p className="text-xs text-destructive">{form.formState.errors.contact_email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input {...form.register("country")} />
          </div>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{editing ? "Save" : "Create"}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
