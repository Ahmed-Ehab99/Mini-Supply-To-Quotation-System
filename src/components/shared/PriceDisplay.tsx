import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

export function PriceDisplay({
  amount,
  currency,
  className,
  emphasize,
}: {
  amount: number;
  currency?: string;
  className?: string;
  emphasize?: boolean;
}) {
  return (
    <span
      className={cn(
        "tabular-nums",
        emphasize && "font-semibold text-foreground",
        className,
      )}
    >
      {formatPrice(amount, currency)}
    </span>
  );
}
