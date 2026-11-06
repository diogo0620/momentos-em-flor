ALTER TABLE "MoloniFiscalDocument"
ADD COLUMN "creditNoteRequiredAt" TIMESTAMP(3),
ADD COLUMN "creditNoteId" TEXT,
ADD COLUMN "creditNoteRecordedAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "MoloniFiscalDocument_creditNoteId_key" ON "MoloniFiscalDocument"("creditNoteId");
