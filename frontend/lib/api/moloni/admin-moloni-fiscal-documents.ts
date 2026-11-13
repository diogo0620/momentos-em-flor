import { BaseApi } from "../common/base-api";
import { apiFetch, apiFetchBlob } from "../common/client";
import type { MoloniFiscalDocument } from "@/types/moloni/admin/moloni-fiscal-document";

class AdminMoloniFiscalDocumentsApi extends BaseApi<
  MoloniFiscalDocument,
  MoloniFiscalDocument,
  never,
  never
> {
  constructor() {
    super("/admin/moloni/fiscal-documents");
  }

  async issue(id: number): Promise<void> {
    await apiFetch(`${this.endpoint}/${id}/issue`, { method: "POST" });
  }

  async getDetail(id: number): Promise<MoloniFiscalDocument> {
    return apiFetch<MoloniFiscalDocument>(`${this.endpoint}/${id}`);
  }

  async getRepairContext<T>(id: number): Promise<T> {
    return apiFetch<T>(`${this.endpoint}/${id}/repair-context`);
  }

  async recordCreditNote(id: number, creditNoteId: string): Promise<void> {
    await apiFetch(`${this.endpoint}/${id}/record-credit-note`, {
      method: "POST",
      body: JSON.stringify({ creditNoteId }),
    });
  }

  async issueCreditNote(id: number): Promise<void> {
    await apiFetch(`${this.endpoint}/${id}/issue-credit-note`, {
      method: "POST",
    });
  }

  async confirmInvoice(id: number): Promise<void> {
    await apiFetch(`${this.endpoint}/${id}/confirm-invoice`, { method: "POST" });
  }

  async confirmCreditNote(id: number): Promise<void> {
    await apiFetch(`${this.endpoint}/${id}/confirm-credit-note`, { method: "POST" });
  }

  async sendInvoiceEmail(id: number): Promise<void> {
    await apiFetch(`${this.endpoint}/${id}/send-invoice-email`, { method: "POST" });
  }

  async sendCreditNoteEmail(id: number): Promise<void> {
    await apiFetch(`${this.endpoint}/${id}/send-credit-note-email`, { method: "POST" });
  }

  async getPdf(
    id: number,
    kind: "invoice" | "credit-note",
  ): Promise<Blob> {
    return apiFetchBlob(`${this.endpoint}/${id}/${kind}-pdf`);
  }
}

export const adminMoloniFiscalDocumentsApi =
  new AdminMoloniFiscalDocumentsApi();
