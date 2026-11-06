ALTER TABLE "StoreSettings" ADD COLUMN "deliveryTaxCodeId" INTEGER;
CREATE INDEX "StoreSettings_deliveryTaxCodeId_idx" ON "StoreSettings"("deliveryTaxCodeId");
ALTER TABLE "StoreSettings"
ADD CONSTRAINT "StoreSettings_deliveryTaxCodeId_fkey"
FOREIGN KEY ("deliveryTaxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
