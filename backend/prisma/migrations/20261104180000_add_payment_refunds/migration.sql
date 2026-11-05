CREATE TYPE "PaymentRefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

CREATE TABLE "PaymentRefund" (
    "id" SERIAL NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "stripeRefundId" TEXT,
    "status" "PaymentRefundStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "reason" TEXT NOT NULL,
    "requestedByUserId" INTEGER NOT NULL,
    "failureReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "PaymentRefund_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentRefund_paymentId_key" ON "PaymentRefund"("paymentId");
CREATE UNIQUE INDEX "PaymentRefund_stripeRefundId_key" ON "PaymentRefund"("stripeRefundId");
CREATE INDEX "PaymentRefund_status_idx" ON "PaymentRefund"("status");

ALTER TABLE "PaymentRefund"
ADD CONSTRAINT "PaymentRefund_paymentId_fkey"
FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
