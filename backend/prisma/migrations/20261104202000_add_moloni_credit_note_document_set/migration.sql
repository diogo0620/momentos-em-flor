ALTER TABLE "MoloniSettings" ADD COLUMN "creditNoteDocumentSetId" TEXT;

ALTER TABLE "MoloniFiscalDocument"
ADD COLUMN "creditNoteStatus" "MoloniDocumentStatus" NOT NULL DEFAULT 'NOT_REQUIRED';

CREATE INDEX "MoloniFiscalDocument_creditNoteStatus_idx"
ON "MoloniFiscalDocument"("creditNoteStatus");
