import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { MoreHorizontal, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import {
  useCreateMaterial, useDeleteMaterial, useMaterials, useUpdateMaterial,
} from "@/hooks/useMaterials";
import {
  materialSchema, type MaterialFormValues,
} from "@/schemas/material.schema";
import type { Material, MaterialCategory } from "@/types";

export const Route = createFileRoute("/catalog")({
  head: () => ({ meta: [{ title: "Materials — SupplyQ" }] }),
  component: MaterialCatalogPage,
});

const UNITS = ["kg", "ton", "unit", "meter", "liter", "m2", "m3"] as const;
const CATEGORIES: MaterialCategory[] = [
  "raw_material", "component", "consumable", "equipment", "packaging",
];
const CAT_LABEL: Record<MaterialCategory, string> = {
  raw_material: "Raw Material",
  component: "Component",
  consumable: "Consumable",
  equipment: "Equipment",
  packaging: "Packaging",
};

function MaterialCatalogPage() {
  const { data, isLoading } = useMaterials();
  const create = useCreateMaterial();
  const update = useUpdateMaterial();
  const del = useDeleteMaterial();

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Material | null>(null);
  const [open, setOpen] = useState(false);

  const filtered = (data ?? []).filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = catFilter === "all" || m.category === catFilter;
    return matchesSearch && matchesCat;
  });

  const openNew = () => { setEditing(null); setOpen(true); };
  const openEdit = (m: Material) => { setEditing(m); setOpen(true); };

  return (
    <div>
      <PageHeader
        title="Materials"
        description="Your full catalog of materials available for quotation."
        actions={
          <Button onClick={openNew}>
            <Plus className="mr-2 h-4 w-4" /> Add Material
          </Button>
        }
      />

      <Card className="p-4">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search materials…"
              className="pl-9"
            />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{CAT_LABEL[c]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No materials yet"
            description="Add your first material to start building offers and quotations."
            action={{ label: "Add Material", onClick: openNew }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Description</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((m, i) => (
                <motion.tr
                  key={m.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, delay: i * 0.02 }}
                  className="border-b transition-colors hover:bg-accent/40"
                >
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{CAT_LABEL[m.category]}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.unit}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {m.description ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(m)}>
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
                          title={`Delete "${m.name}"?`}
                          description="This cannot be undone. Linked offers will block deletion."
                          onConfirm={() => del.mutate(m.id)}
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <MaterialSheet
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSubmit={(values) => {
          if (editing) {
            update.mutate(
              { id: editing.id, data: values },
              { onSuccess: () => setOpen(false) },
            );
          } else {
            create.mutate(values, { onSuccess: () => setOpen(false) });
          }
        }}
      />
    </div>
  );
}

function MaterialSheet({
  open, onOpenChange, editing, onSubmit,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editing: Material | null;
  onSubmit: (v: MaterialFormValues) => void;
}) {
  const form = useForm<MaterialFormValues>({
    resolver: zodResolver(materialSchema),
    values: editing
      ? {
          name: editing.name,
          description: editing.description ?? "",
          unit: editing.unit,
          category: editing.category,
        }
      : { name: "", description: "", unit: "kg", category: "raw_material" },
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? "Edit material" : "New material"}</SheetTitle>
          <SheetDescription>
            Define a material that can be quoted and sourced from suppliers.
          </SheetDescription>
        </SheetHeader>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 px-4"
        >
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...form.register("name")} placeholder="e.g. Steel Pipe 50mm" />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Select
                value={form.watch("unit")}
                onValueChange={(v) => form.setValue("unit", v as MaterialFormValues["unit"])}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={form.watch("category")}
                onValueChange={(v) =>
                  form.setValue("category", v as MaterialFormValues["category"])
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>{CAT_LABEL[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea {...form.register("description")} rows={3} />
          </div>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{editing ? "Save changes" : "Create"}</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
