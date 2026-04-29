import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OfferStatus, QuotationStatus } from "@/types";

type AnyStatus = OfferStatus | QuotationStatus;

const styles: Record<AnyStatus, string> = {
  active: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  expired: "bg-zinc-200/60 text-zinc-700 border-zinc-300",
  withdrawn: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  draft: "bg-zinc-200/60 text-zinc-700 border-zinc-300",
  sent: "bg-indigo-500/15 text-indigo-700 border-indigo-500/30",
  accepted: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  rejected: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  cancelled: "bg-zinc-200/60 text-zinc-600 border-zinc-300",
};

export function StatusBadge({ status }: { status: AnyStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-medium", styles[status])}
    >
      {status}
    </Badge>
  );
}
