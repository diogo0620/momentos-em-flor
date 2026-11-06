-- CreateEnum
CREATE TYPE "ProductPricingType" AS ENUM ('FIXED', 'PER_UNIT');

-- CreateEnum
CREATE TYPE "PricingMarginType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE', 'FIXED_PRICE');

-- AlterTable
ALTER TABLE "Address" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Florist" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "pricingType" "ProductPricingType" NOT NULL,
    "basePrice" DECIMAL(10,2) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FloristProduct" (
    "id" SERIAL NOT NULL,
    "floristId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "marginType" "PricingMarginType" NOT NULL,
    "pricingValue" DECIMAL(10,2),
    "fixedPrice" DECIMAL(10,2),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "minimumQuantity" INTEGER,
    "maximumQuantity" INTEGER,
    "quantityStep" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FloristProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_active_idx" ON "Product"("active");

-- CreateIndex
CREATE INDEX "Product_deletedAt_idx" ON "Product"("deletedAt");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "FloristProduct_floristId_idx" ON "FloristProduct"("floristId");

-- CreateIndex
CREATE INDEX "FloristProduct_productId_idx" ON "FloristProduct"("productId");

-- CreateIndex
CREATE INDEX "FloristProduct_enabled_idx" ON "FloristProduct"("enabled");

-- CreateIndex
CREATE UNIQUE INDEX "FloristProduct_floristId_productId_key" ON "FloristProduct"("floristId", "productId");

-- CreateIndex
CREATE INDEX "Address_deletedAt_idx" ON "Address"("deletedAt");

-- CreateIndex
CREATE INDEX "Category_deletedAt_idx" ON "Category"("deletedAt");

-- CreateIndex
CREATE INDEX "Florist_deletedAt_idx" ON "Florist"("deletedAt");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloristProduct" ADD CONSTRAINT "FloristProduct_floristId_fkey" FOREIGN KEY ("floristId") REFERENCES "Florist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloristProduct" ADD CONSTRAINT "FloristProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
