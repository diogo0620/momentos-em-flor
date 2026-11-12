ALTER TABLE "Product" ADD COLUMN "addonOnly" BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX "Product_addonOnly_idx" ON "Product"("addonOnly");

ALTER TABLE "StoreSettings"
  ADD COLUMN "companyName" TEXT NOT NULL DEFAULT 'Momentos em Flor',
  ADD COLUMN "contactEmail" TEXT,
  ADD COLUMN "contactPhone" TEXT,
  ADD COLUMN "whatsappNumber" TEXT,
  ADD COLUMN "companyAddress" TEXT,
  ADD COLUMN "partnerEmail" TEXT;
