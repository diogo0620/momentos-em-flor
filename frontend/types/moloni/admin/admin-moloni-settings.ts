
export type AdminMoloniSettings = {
    configured: boolean;
    companyId?: string;
    clientId?: string;
    username?: string;
    hasCredentials: boolean;
    connected: boolean;
    lastConnectionCheckAt?: string | null;
    lastConnectionError?: string | null;
    createdAt?: string;
    updatedAt?: string;
    invoiceDocumentSetId?: string | null;
    creditNoteDocumentSetId?: string | null;
    receiptDocumentSetId?: string | null;
    paymentMethodId?: string | null;
    defaultCustomerId?: string | null;
    defaultProductId?: string | null;
    defaultTaxId?: string | null;
    defaultTaxRate?: string | null;
    issueReceiptAfterPayment: boolean;
    fiscalConfigurationComplete: boolean;
}
