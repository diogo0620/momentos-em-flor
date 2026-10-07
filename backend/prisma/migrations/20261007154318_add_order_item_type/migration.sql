-- CreateEnum
CREATE TYPE "OrderItemType" AS ENUM ('PRODUCT', 'DELIVERY_FEE');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "type" "OrderItemType" NOT NULL DEFAULT 'PRODUCT';
