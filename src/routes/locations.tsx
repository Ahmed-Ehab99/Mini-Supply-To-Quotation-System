import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import {
  useCreateLocation,
  useDeleteLocation,
  useLocations,
  useUpdateLocation,
} from "@/hooks/useLocations";
import {
  locationSchema,
  type LocationFormValues,
} from "@/schemas/location.schema";
import type { Location } from "@/types";

export const Route = createFileRoute("/locations")({
  head: () => ({ meta: [{ title: "Locations — SupplyQ" }] }),
  component: LocationsPage,
});

function LocationsPage() {
  const { data, isLoading } = useLocations();
  const create = useCreateLocation();
  const update = useUpdateLocation();
  const del = useDeleteLocation();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Location | null>(null);

  return (
    <div>
      <PageHeader
        title="Locations"
        description="Delivery destinations used in quotations and delivery rates."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Location
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
            icon={MapPin}
            title="No locations yet"
            description="Add destinations so you can attach delivery rates."
            action={{ label: "Add Location", onClick: () => setOpen(true) }}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-medium">{l.name}</TableCell>
                  <TableCell>{l.city}</TableCell>
                  <TableCell>{l.country}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {l.zone_code ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditing(l);
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
                          title={`Delete "${l.name}"?`}
                          onConfirm={() => del.mutate(l.id)}
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

      <LocationSheet
        open={open}
        onOpenChange={setOpen}
        editing={editing}
        onSubmit={(v) => {
          const payload = { ...v, zone_code: v.zone_code || null };
          if (editing) {
            update.mutate(
              { id: editing.id, data: payload },
              { onSuccess: () => setOpen(false) },
            );
          } else {
            create.mutate(
              {
                name: payload.name,
                city: payload.city,
                country: payload.country,
                zone_code: payload.zone_code,
              },
              { onSuccess: () => setOpen(false) },
            );
          }
        }}
      />
    </div>
  );
}

function LocationSheet({
  open,
  onOpenChange,
  editing,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  editing: Location | null;
  onSubmit: (v: LocationFormValues) => void;
}) {
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationSchema),
    values: editing
      ? {
          name: editing.name,
          city: editing.city,
          country: editing.country,
          zone_code: editing.zone_code ?? "",
        }
      : { name: "", city: "", country: "", zone_code: "" },
  });
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{editing ? "Edit location" : "New location"}</SheetTitle>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              {...form.register("name")}
              placeholder="e.g. Cairo Warehouse"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>City</Label>
              <Input {...form.register("city")} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input {...form.register("country")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Zone code (optional)</Label>
            <Input {...form.register("zone_code")} />
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
