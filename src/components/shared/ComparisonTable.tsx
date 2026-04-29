import { motion } from "framer-motion";
import { AlertTriangle, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { PriceDisplay } from "./PriceDisplay";
import type { SupplierOfferWithDetails } from "@/types";

export function ComparisonTable({
  offers,
  onSelect,
  selectedOfferId,
}: {
  offers: SupplierOfferWithDetails[];
  onSelect: (offer: SupplierOfferWithDetails) => void;
  selectedOfferId?: string;
}) {
  if (offers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        No active supplier offers found for this material.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="p-3 text-left">Supplier</th>
            <th className="p-3 text-right">Base price</th>
            <th className="p-3 text-right">Delivery</th>
            <th className="p-3 text-right">Effective</th>
            <th className="p-3 text-left">Lead</th>
            <th className="p-3 text-left">Incoterm</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {offers.map((o, i) => {
            const best = i === 0;
            const selected = o.id === selectedOfferId;
            const noRate = !o.delivery_rate;
            return (
              <motion.tr
                key={o.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15, delay: i * 0.03 }}
                onClick={() => onSelect(o)}
                className={cn(
                  "cursor-pointer border-t transition-colors",
                  selected
                    ? "bg-primary/10 ring-1 ring-inset ring-primary"
                    : best
                      ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                      : "hover:bg-accent/50",
                )}
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {selected && <Check className="h-4 w-4 text-primary" />}
                    <div>
                      <div className="font-medium">{o.supplier.name}</div>
                      {o.supplier.country && (
                        <div className="text-xs text-muted-foreground">
                          {o.supplier.country}
                        </div>
                      )}
                    </div>
                    {best && (
                      <span className="ml-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                        Best
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-3 text-right">
                  <PriceDisplay
                    amount={Number(o.unit_price)}
                    currency={o.currency}
                  />
                </td>
                <td className="p-3 text-right">
                  {noRate ? (
                    <span className="inline-flex items-center gap-1 text-xs text-amber-700">
                      <AlertTriangle className="h-3 w-3" /> No rate
                    </span>
                  ) : (
                    <PriceDisplay amount={o.delivery_rate!.cost_per_unit} />
                  )}
                </td>
                <td className="p-3 text-right">
                  <PriceDisplay amount={o.effective_price} emphasize />
                </td>
                <td className="p-3 text-muted-foreground">
                  {o.delivery_rate?.lead_time_days
                    ? `${o.delivery_rate.lead_time_days}d`
                    : "—"}
                </td>
                <td className="p-3 text-muted-foreground">
                  {o.delivery_rate?.incoterm ?? "—"}
                </td>
                <td className="p-3 text-right">
                  <input
                    type="radio"
                    checked={selected}
                    onChange={() => onSelect(o)}
                    className="h-4 w-4 accent-primary"
                  />
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
