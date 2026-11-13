
export type AdminConfigureMoloni = {
    companyId: string;
    clientId: string;
    clientSecret: string;
    username: string;
    password: string;
    invoiceDocumentSetId: string;
    creditNoteDocumentSetId: string;
    paymentMethodId: string;
    createDocumentsAsDraft: boolean;
    signedPdf: boolean;
}
