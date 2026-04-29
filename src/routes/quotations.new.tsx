import { createFileRoute } from "@tanstack/react-router";
import { QuotationBuilder } from "@/components/quotation/QuotationBuilder";

export const Route = createFileRoute("/quotations/new")({
  head: () => ({ meta: [{ title: "New Quotation — SupplyQ" }] }),
  component: () => <QuotationBuilder />,
});
