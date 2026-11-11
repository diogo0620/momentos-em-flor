import { redirect } from "next/navigation";

export default async function LegacyFiscalDocumentRepairPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/fiscal-documents/${id}`);
}
