-- CreateEnum
CREATE TYPE "OrderCancellationReason" AS ENUM ('NO_FLORIST_AVAILABLE', 'CUSTOMER_REQUEST', 'ADMIN_REQUEST', 'PAYMENT_FAILED', 'OTHER');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "cancellationReason" "OrderCancellationReason",
ADD COLUMN     "cancelledAt" TIMESTAMP(3);
