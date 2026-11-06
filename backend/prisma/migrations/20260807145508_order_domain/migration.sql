/*
  Warnings:

  - You are about to drop the `FloristProduct` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CREATED', 'WAITING_FOR_FLORISTS', 'ASSIGNED', 'IN_PRODUCTION', 'READY_FOR_DELIVERY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DeliveryTimeSlot" AS ENUM ('MORNING', 'AFTERNOON', 'EVENING');

-- CreateEnum
CREATE TYPE "Occasion" AS ENUM ('BIRTHDAY', 'ANNIVERSARY', 'LOVE', 'WEDDING', 'FUNERAL', 'NEW_BABY', 'MOTHERS_DAY', 'FATHERS_DAY', 'CHRISTMAS', 'OTHER');

-- CreateEnum
CREATE TYPE "OrderOfferStatus" AS ENUM ('PENDING', 'VIEWED', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- DropForeignKey
ALTER TABLE "FloristProduct" DROP CONSTRAINT "FloristProduct_floristId_fkey";

-- DropForeignKey
ALTER TABLE "FloristProduct" DROP CONSTRAINT "FloristProduct_productId_fkey";

-- DropTable
DROP TABLE "FloristProduct";

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "customerId" INTEGER NOT NULL,
    "customerFirstName" TEXT NOT NULL,
    "customerLastName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "recipientFirstName" TEXT NOT NULL,
    "recipientLastName" TEXT,
    "recipientPhone" TEXT,
    "occasion" "Occasion",
    "deliveryDate" TIMESTAMP(3) NOT NULL,
    "deliveryTimeSlot" "DeliveryTimeSlot" NOT NULL,
    "deliveryInstructions" TEXT,
    "deliveryStreet" TEXT NOT NULL,
    "deliveryStreet2" TEXT,
    "deliveryPostalCode" TEXT NOT NULL,
    "deliveryCity" TEXT NOT NULL,
    "deliveryDistrict" TEXT NOT NULL,
    "deliveryCountryCode" CHAR(2) NOT NULL,
    "deliveryLatitude" DECIMAL(9,6) NOT NULL,
    "deliveryLongitude" DECIMAL(9,6) NOT NULL,
    "cardMessage" TEXT,
    "notes" TEXT,
    "subtotal" DECIMAL(10,2) NOT NULL,
    "deliveryFee" DECIMAL(10,2) NOT NULL,
    "discount" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'CREATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "productDescription" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "lineTotal" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderOffer" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "floristId" INTEGER NOT NULL,
    "compensationAmount" DECIMAL(10,2) NOT NULL,
    "status" "OrderOfferStatus" NOT NULL DEFAULT 'PENDING',
    "viewedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "declineReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderOffer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FloristCompensationRule" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "floristId" INTEGER,
    "compensationAmount" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FloristCompensationRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- CreateIndex
CREATE INDEX "Order_customerId_idx" ON "Order"("customerId");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_deliveryDate_idx" ON "Order"("deliveryDate");

-- CreateIndex
CREATE INDEX "Order_deletedAt_idx" ON "Order"("deletedAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_productId_idx" ON "OrderItem"("productId");

-- CreateIndex
CREATE INDEX "OrderOffer_orderId_idx" ON "OrderOffer"("orderId");

-- CreateIndex
CREATE INDEX "OrderOffer_floristId_idx" ON "OrderOffer"("floristId");

-- CreateIndex
CREATE INDEX "OrderOffer_status_idx" ON "OrderOffer"("status");

-- CreateIndex
CREATE INDEX "OrderOffer_expiresAt_idx" ON "OrderOffer"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "OrderOffer_orderId_floristId_key" ON "OrderOffer"("orderId", "floristId");

-- CreateIndex
CREATE INDEX "FloristCompensationRule_productId_idx" ON "FloristCompensationRule"("productId");

-- CreateIndex
CREATE INDEX "FloristCompensationRule_floristId_idx" ON "FloristCompensationRule"("floristId");

-- CreateIndex
CREATE INDEX "FloristCompensationRule_active_idx" ON "FloristCompensationRule"("active");

-- CreateIndex
CREATE UNIQUE INDEX "FloristCompensationRule_productId_floristId_key" ON "FloristCompensationRule"("productId", "floristId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderOffer" ADD CONSTRAINT "OrderOffer_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderOffer" ADD CONSTRAINT "OrderOffer_floristId_fkey" FOREIGN KEY ("floristId") REFERENCES "Florist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloristCompensationRule" ADD CONSTRAINT "FloristCompensationRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloristCompensationRule" ADD CONSTRAINT "FloristCompensationRule_floristId_fkey" FOREIGN KEY ("floristId") REFERENCES "Florist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
