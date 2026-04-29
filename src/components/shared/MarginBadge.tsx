import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function MarginBadge({ marginPct }: { marginPct: number }) {
  const tone =
    marginPct >= 20
      ? "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
      : marginPct >= 10
        ? "bg-amber-500/15 text-amber-700 border-amber-500/30"
        : "bg-rose-500/15 text-rose-700 border-rose-500/30";
  return (
    <Badge variant="outline" className={cn("font-semibold tabular-nums", tone)}>
      {marginPct.toFixed(1)}%
    </Badge>
  );
}
