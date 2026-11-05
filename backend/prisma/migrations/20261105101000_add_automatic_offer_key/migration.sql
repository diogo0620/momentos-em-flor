ALTER TABLE "OrderOffer" ADD COLUMN "automationKey" TEXT;
CREATE UNIQUE INDEX "OrderOffer_automationKey_key" ON "OrderOffer"("automationKey");
