-- CreateTable
CREATE TABLE "ProductComponent" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "minQuantity" INTEGER NOT NULL,
    "recommendedQuantity" INTEGER NOT NULL,
    "maxQuantity" INTEGER NOT NULL,
    "customerPricePerAdditionalUnit" DECIMAL(10,2) NOT NULL,
    "floristCompensationPerAdditionalUnit" DECIMAL(10,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProductComponent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductComponent_productId_idx" ON "ProductComponent"("productId");

-- CreateIndex
CREATE INDEX "ProductComponent_active_idx" ON "ProductComponent"("active");

-- CreateIndex
CREATE INDEX "ProductComponent_deletedAt_idx" ON "ProductComponent"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ProductComponent_productId_name_key" ON "ProductComponent"("productId", "name");

-- AddForeignKey
ALTER TABLE "ProductComponent" ADD CONSTRAINT "ProductComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
