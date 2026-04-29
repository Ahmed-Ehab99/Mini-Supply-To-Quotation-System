import { createFileRoute } from "@tanstack/react-router";
import { QuotationBuilder } from "@/components/quotation/QuotationBuilder";

export const Route = createFileRoute("/quotations/$id/edit")({
  head: () => ({ meta: [{ title: "Edit Quotation — SupplyQ" }] }),
  component: EditQuotation,
});

function EditQuotation() {
  const { id } = Route.useParams();
  return <QuotationBuilder quotationId={id} />;
}
