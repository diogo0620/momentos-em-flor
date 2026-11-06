import { BaseApi } from "../common/base-api";
import { apiFetch } from "../common/client";
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

    async getPdfLink(
        id: number,
        kind: "invoice" | "receipt" | "credit-note",
    ): Promise<{ url: string }> {
        return apiFetch<{ url: string }>(`${this.endpoint}/${id}/${kind}-pdf`);
    }
}

export const adminMoloniFiscalDocumentsApi = new AdminMoloniFiscalDocumentsApi();
