import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { FileText, Package, PlusCircle, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useMaterials } from "@/hooks/useMaterials";
import { useSupplierOffers } from "@/hooks/useSupplierOffers";
import { useQuotations } from "@/hooks/useQuotations";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — SupplyQ" },
      {
        name: "description",
        content: "Overview of materials, offers, and quotations.",
      },
    ],
  }),
  component: DashboardPage,
});

function StatCard({
  label,
  value,
  icon: Icon,
  delay = 0,
  tone = "indigo",
}: {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  delay?: number;
  tone?: "indigo" | "emerald" | "amber" | "rose";
}) {
  const tones: Record<string, string> = {
    indigo: "bg-indigo-500/10 text-indigo-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    amber: "bg-amber-500/10 text-amber-600",
    rose: "bg-rose-500/10 text-rose-600",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
    >
      <Card className="rounded-xl">
        <CardContent className="flex items-center gap-4 p-5">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-lg ${tones[tone]}`}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DashboardPage() {
  const { data: materials } = useMaterials();
  const { data: offers } = useSupplierOffers({ status: "active" });
  const { data: quotations } = useQuotations();

  const drafts = (quotations ?? []).filter((q) => q.status === "draft").length;
  const sent = (quotations ?? []).filter((q) => q.status === "sent").length;
  const recent = (quotations ?? []).slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Welcome back. Here's what's happening across your supply pipeline."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Materials"
          value={materials?.length ?? 0}
          icon={Package}
          delay={0}
          tone="indigo"
        />
        <StatCard
          label="Active Offers"
          value={offers?.length ?? 0}
          icon={Tag}
          delay={0.05}
          tone="emerald"
        />
        <StatCard
          label="Draft Quotations"
          value={drafts}
          icon={FileText}
          delay={0.1}
          tone="amber"
        />
        <StatCard
          label="Sent Quotations"
          value={sent}
          icon={FileText}
          delay={0.15}
          tone="rose"
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/quotations/new">
            <PlusCircle className="mr-2 h-4 w-4" /> New Quotation
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/offers/new">
            <Tag className="mr-2 h-4 w-4" /> New Offer
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/catalog">
            <Package className="mr-2 h-4 w-4" /> Add Material
          </Link>
        </Button>
      </div>

      <Card className="mt-8 rounded-xl">
        <CardHeader>
          <CardTitle className="text-base">Recent quotations</CardTitle>
        </CardHeader>
        <CardContent>
          {recent.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No quotations yet. Create your first one to get started.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="font-medium">
                      {q.reference_number}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={q.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(q.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link to="/quotations/$id" params={{ id: q.id }}>
                          Open
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
