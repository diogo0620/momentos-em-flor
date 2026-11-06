CREATE TYPE "FloristCompensationStatus" AS ENUM (
    'PENDING_DELIVERY',
    'DUE',
    'PAID',
    'CANCELLED'
);

CREATE TABLE "FloristCompensation" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "orderOfferId" INTEGER NOT NULL,
    "floristId" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "FloristCompensationStatus" NOT NULL DEFAULT 'PENDING_DELIVERY',
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "paymentReference" TEXT,
    "paymentNotes" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "cancellationReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FloristCompensation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FloristCompensation_orderId_key"
ON "FloristCompensation"("orderId");

CREATE UNIQUE INDEX "FloristCompensation_orderOfferId_key"
ON "FloristCompensation"("orderOfferId");

CREATE INDEX "FloristCompensation_floristId_status_idx"
ON "FloristCompensation"("floristId", "status");

CREATE INDEX "FloristCompensation_status_dueAt_idx"
ON "FloristCompensation"("status", "dueAt");

CREATE INDEX "FloristCompensation_paidAt_idx"
ON "FloristCompensation"("paidAt");

ALTER TABLE "FloristCompensation"
ADD CONSTRAINT "FloristCompensation_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FloristCompensation"
ADD CONSTRAINT "FloristCompensation_orderOfferId_fkey"
FOREIGN KEY ("orderOfferId") REFERENCES "OrderOffer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FloristCompensation"
ADD CONSTRAINT "FloristCompensation_floristId_fkey"
FOREIGN KEY ("floristId") REFERENCES "Florist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
