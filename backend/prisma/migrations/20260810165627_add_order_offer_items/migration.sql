-- DropForeignKey
ALTER TABLE "OrderOffer" DROP CONSTRAINT "OrderOffer_orderId_fkey";

-- CreateTable
CREATE TABLE "OrderOfferItem" (
    "id" SERIAL NOT NULL,
    "orderOfferId" INTEGER NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitCompensation" DECIMAL(10,2) NOT NULL,
    "totalCompensation" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderOfferItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderOfferItem_orderOfferId_idx" ON "OrderOfferItem"("orderOfferId");

-- CreateIndex
CREATE INDEX "OrderOfferItem_orderItemId_idx" ON "OrderOfferItem"("orderItemId");

-- CreateIndex
CREATE INDEX "OrderOfferItem_productId_idx" ON "OrderOfferItem"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderOfferItem_orderOfferId_orderItemId_key" ON "OrderOfferItem"("orderOfferId", "orderItemId");

-- AddForeignKey
ALTER TABLE "OrderOffer" ADD CONSTRAINT "OrderOffer_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderOfferItem" ADD CONSTRAINT "OrderOfferItem_orderOfferId_fkey" FOREIGN KEY ("orderOfferId") REFERENCES "OrderOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderOfferItem" ADD CONSTRAINT "OrderOfferItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
