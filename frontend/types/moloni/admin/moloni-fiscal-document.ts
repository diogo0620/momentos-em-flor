export type MoloniDocumentStatus =
    | "QUEUED"
    | "PROCESSING"
    | "ISSUED"
    | "FAILED"
    | "NOT_REQUIRED";

export type MoloniFiscalDocument = {
    id: number;
    orderId: number;
    orderNumber: string;
    customerId: number | null;
    customerName: string;
    customerEmail: string;
    customerTaxNumber: string | null;
    total: number;
    currency: string;
    invoiceStatus: MoloniDocumentStatus;
    invoiceId: string | null;
    invoiceIssuedAt: string | null;
    invoiceEmailId: string | null;
    invoiceEmailSentAt: string | null;
    invoiceEmailLastError: string | null;
    receiptStatus: MoloniDocumentStatus;
    receiptId: string | null;
    receiptIssuedAt: string | null;
    creditNoteRequiredAt: string | null;
    creditNoteStatus: MoloniDocumentStatus;
    creditNoteId: string | null;
    creditNoteRecordedAt: string | null;
    attempts: number;
    lastAttemptAt: string | null;
    lastError: string | null;
    createdAt: string;
    updatedAt: string;
};
