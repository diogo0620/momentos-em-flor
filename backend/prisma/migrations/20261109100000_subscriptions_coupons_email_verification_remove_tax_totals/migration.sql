CREATE TYPE "DiscountType" AS ENUM ('PERCENTAGE', 'FIXED_AMOUNT');
CREATE TYPE "FloristSubscriptionStatus" AS ENUM ('FREE', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'INCOMPLETE');

CREATE TABLE "EmailVerificationToken" (
    "id" SERIAL NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Coupon" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "DiscountType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minimumOrderAmount" DECIMAL(10,2),
    "maximumDiscountAmount" DECIMAL(10,2),
    "startsAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "maximumRedemptions" INTEGER,
    "maximumRedemptionsPerCustomer" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "CouponRedemption" (
    "id" SERIAL NOT NULL,
    "couponId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "orderId" INTEGER NOT NULL,
    "discountAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CouponRedemption_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FloristSubscriptionPlan" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "monthlyPrice" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "stripePriceId" TEXT,
    "free" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FloristSubscriptionPlan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FloristSubscription" (
    "id" SERIAL NOT NULL,
    "floristId" INTEGER NOT NULL,
    "planId" INTEGER NOT NULL,
    "status" "FloristSubscriptionStatus" NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "FloristSubscription_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Order" ADD COLUMN "couponId" INTEGER;
ALTER TABLE "Order" ADD COLUMN "couponCode" TEXT;

CREATE UNIQUE INDEX "EmailVerificationToken_tokenHash_key" ON "EmailVerificationToken"("tokenHash");
CREATE INDEX "EmailVerificationToken_userId_idx" ON "EmailVerificationToken"("userId");
CREATE INDEX "EmailVerificationToken_expiresAt_idx" ON "EmailVerificationToken"("expiresAt");
CREATE UNIQUE INDEX "Coupon_code_key" ON "Coupon"("code");
CREATE INDEX "Coupon_active_startsAt_expiresAt_idx" ON "Coupon"("active", "startsAt", "expiresAt");
CREATE UNIQUE INDEX "CouponRedemption_orderId_key" ON "CouponRedemption"("orderId");
CREATE INDEX "CouponRedemption_couponId_customerId_idx" ON "CouponRedemption"("couponId", "customerId");
CREATE INDEX "CouponRedemption_couponId_createdAt_idx" ON "CouponRedemption"("couponId", "createdAt");
CREATE UNIQUE INDEX "FloristSubscriptionPlan_code_key" ON "FloristSubscriptionPlan"("code");
CREATE UNIQUE INDEX "FloristSubscriptionPlan_stripePriceId_key" ON "FloristSubscriptionPlan"("stripePriceId");
CREATE INDEX "FloristSubscriptionPlan_active_sortOrder_idx" ON "FloristSubscriptionPlan"("active", "sortOrder");
CREATE UNIQUE INDEX "FloristSubscription_stripeSubscriptionId_key" ON "FloristSubscription"("stripeSubscriptionId");
CREATE INDEX "FloristSubscription_floristId_status_idx" ON "FloristSubscription"("floristId", "status");
CREATE INDEX "FloristSubscription_planId_idx" ON "FloristSubscription"("planId");
CREATE INDEX "Order_couponId_idx" ON "Order"("couponId");

ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Order" ADD CONSTRAINT "Order_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "CouponRedemption" ADD CONSTRAINT "CouponRedemption_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FloristSubscription" ADD CONSTRAINT "FloristSubscription_floristId_fkey" FOREIGN KEY ("floristId") REFERENCES "Florist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FloristSubscription" ADD CONSTRAINT "FloristSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "FloristSubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

INSERT INTO "FloristSubscriptionPlan" ("code", "name", "description", "monthlyPrice", "currency", "free", "active", "sortOrder", "updatedAt")
VALUES ('FREE', 'Gratuito', 'Acesso gratuito à plataforma.', 0, 'EUR', true, true, 0);

INSERT INTO "FloristSubscription" ("floristId", "planId", "status", "updatedAt")
SELECT f."id", p."id", 'FREE'::"FloristSubscriptionStatus", CURRENT_TIMESTAMP
FROM "Florist" f
CROSS JOIN "FloristSubscriptionPlan" p
WHERE p."code" = 'FREE';

DROP TABLE "OrderTaxTotal";
