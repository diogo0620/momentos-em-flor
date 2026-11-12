CREATE TYPE "CouponDiscountApplication" AS ENUM ('PRODUCT_LINES', 'ALL_LINES', 'DELIVERY_FEE');

ALTER TABLE "Coupon"
ADD COLUMN "discountApplication" "CouponDiscountApplication" NOT NULL DEFAULT 'PRODUCT_LINES';

ALTER TABLE "Order"
ADD COLUMN "billingSameAsDelivery" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "billingStreet" TEXT,
ADD COLUMN "billingStreetNumber" TEXT,
ADD COLUMN "billingStreet2" TEXT,
ADD COLUMN "billingPostalCode" TEXT,
ADD COLUMN "billingCity" TEXT,
ADD COLUMN "billingDistrict" TEXT,
ADD COLUMN "billingCountryCode" CHAR(2),
ADD COLUMN "couponDiscountApplication" "CouponDiscountApplication";

UPDATE "Order"
SET
  "billingStreet" = "deliveryStreet",
  "billingStreetNumber" = "deliveryStreetNumber",
  "billingStreet2" = "deliveryStreet2",
  "billingPostalCode" = "deliveryPostalCode",
  "billingCity" = "deliveryCity",
  "billingDistrict" = "deliveryDistrict",
  "billingCountryCode" = "deliveryCountryCode";

ALTER TABLE "Order"
ALTER COLUMN "billingStreet" SET NOT NULL,
ALTER COLUMN "billingStreetNumber" SET NOT NULL,
ALTER COLUMN "billingPostalCode" SET NOT NULL,
ALTER COLUMN "billingCity" SET NOT NULL,
ALTER COLUMN "billingDistrict" SET NOT NULL,
ALTER COLUMN "billingCountryCode" SET NOT NULL;
