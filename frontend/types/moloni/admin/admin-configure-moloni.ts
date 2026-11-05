
export type AdminConfigureMoloni = {
    companyId: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    invoiceDocumentSetId: string;
    creditNoteDocumentSetId: string;
    receiptDocumentSetId: string;
    paymentMethodId: string;
    defaultCustomerId: string;
    defaultProductId: string;
    defaultTaxId: string;
    defaultTaxRate: string;
    issueReceiptAfterPayment: boolean;
}
