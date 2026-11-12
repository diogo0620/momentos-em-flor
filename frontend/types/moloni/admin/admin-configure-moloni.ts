
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
    issueReceiptAfterPayment: boolean;
    signedPdf: boolean;
}
