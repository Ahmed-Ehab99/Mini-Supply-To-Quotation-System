import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Mail,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Users2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useCreateSupplier,
  useDeleteSupplier,
  useSuppliers,
  useUpdateSupplier,
} from "@/hooks/useSuppliers";
import { useSupplierOffers } from "@/hooks/useSupplierOffers";
import {
  supplierSchema,
  type SupplierFormValues,
} from "@/schemas/supplier.schema";
import type { Supplier } from "@/types";

export const Route = createFileRoute("/suppliers")({
  head: () => ({ meta: [{ title: "Suppliers — SupplyQ" }] }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const { data, isLoading } = useSuppliers();
  const { data: offers } = useSupplierOffers({ status: "active" });
  const create = useCreateSupplier();
  const update = useUpdateSupplier();
  const del = useDeleteSupplier();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);

  const offersBySupplier = (offers ?? []).reduce<Record<string, number>>(
    (acc, o) => {
      acc[o.supplier_id] = (acc[o.supplier_id] ?? 0) + 1;
      return acc;
    },
    {},
  );

  return (
    <div>
      <PageHeader
        title="Suppliers"
        description="Vendors you source materials from."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
        }
      />

      {isLoading ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          Loading…
        </p>
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={Users2}
          title="No suppliers yet"
          description="Add your first supplier to start collecting offers."
          action={{
            label: "Add Supplier",
            onClick: () => {
              setEditing(null);
              setOpen(true);
            },
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((s) => (
            <Card
              key={s.id}
              className="rounded-xl transition-shadow hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold">
                      {s.name}
                    </h3>
                    {s.country && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {s.country}
                      </p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setEditing(s);
                          setOpen(true);
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" /> Edit
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
                        title={`Delete "${s.name}"?`}
                        onConfirm={() => del.mutate(s.id)}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                {s.contact_email && (
                  <p className="mt-3 flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    {s.contact_email}
                  </p>
                )}
                <div className="mt-4 flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30"
                  >
                    {offersBySupplier[s.id] ?? 0} active offers
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SupplierSheet
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSubmit={(values) => {
          const payload = {
            name: values.name,
            contact_email: values.contact_email || null,
            country: values.country || null,
          };
          if (editing) {
            update.mutate(
              { id: editing.id, data: payload },
              { onSuccess: () => setOpen(false) },
            );
          } else {
            create.mutate(payload, { onSuccess: () => setOpen(false) });
          }
        }}
      />
    </div>
  );
}

function SupplierSheet({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editing: Supplier | null;
  onSubmit: (v: SupplierFormValues) => void;
}) {
  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    values: editing
      ? {
          name: editing.name,
          contact_email: editing.contact_email ?? "",
          country: editing.country ?? "",
        }
      : { name: "", contact_email: "", country: "" },
  });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? "Edit supplier" : "New supplier"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...form.register("name")} placeholder="e.g. Alpha Metals" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Contact email</Label>
            <Input
              type="email"
              {...form.register("contact_email")}
              placeholder="contact@supplier.com"
            />
            {form.formState.errors.contact_email && (
              <p className="text-xs text-destructive">
                {form.formState.errors.contact_email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input {...form.register("country")} placeholder="e.g. Germany" />
          </div>
          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save" : "Create"}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
