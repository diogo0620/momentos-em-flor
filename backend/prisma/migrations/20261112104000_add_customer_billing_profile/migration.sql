ALTER TABLE "User"
ADD COLUMN "billingStreet" TEXT,
ADD COLUMN "billingStreetNumber" TEXT,
ADD COLUMN "billingStreet2" TEXT,
ADD COLUMN "billingPostalCode" TEXT,
ADD COLUMN "billingCity" TEXT,
ADD COLUMN "billingDistrict" TEXT,
ADD COLUMN "billingCountryCode" CHAR(2);
