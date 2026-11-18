ALTER TABLE "Order"
ADD COLUMN "hidePurchaserIdentity" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "legalTermsVersion" TEXT,
ADD COLUMN "legalTermsAcceptedAt" TIMESTAMP(3);
