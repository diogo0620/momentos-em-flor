/*
  Warnings:

  - You are about to drop the column `altText` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `checksum` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `extension` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `height` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `path` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `storedName` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `uploadedAt` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `width` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `compensationAmount` on the `OrderOffer` table. All the data in the column will be lost.
  - You are about to drop the column `comment` on the `OrderReview` table. All the data in the column will be lost.
  - You are about to drop the column `fromStatus` on the `OrderStatusHistory` table. All the data in the column will be lost.
  - You are about to drop the column `reason` on the `OrderStatusHistory` table. All the data in the column will be lost.
  - You are about to drop the column `toStatus` on the `OrderStatusHistory` table. All the data in the column will be lost.
  - You are about to drop the column `isPrimary` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `tokenId` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `TaxCode` table. All the data in the column will be lost.
  - You are about to drop the `OrderReviewRating` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[floristId,productId,variantId]` on the table `FloristCompensationRule` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenHash]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `key` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subtotal` to the `OrderOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAmount` to the `OrderOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `OrderOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `OrderOfferItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `overallRating` to the `OrderReview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `OrderStatusHistory` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderReview" DROP CONSTRAINT "OrderReview_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderReviewRating" DROP CONSTRAINT "OrderReviewRating_reviewId_fkey";

-- DropIndex
DROP INDEX "File_checksum_key";

-- DropIndex
DROP INDEX "FloristCompensationRule_productId_floristId_key";

-- DropIndex
DROP INDEX "OrderStatusHistory_createdAt_idx";

-- DropIndex
DROP INDEX "ProductImage_variantId_idx";

-- DropIndex
DROP INDEX "RefreshToken_revokedAt_idx";

-- DropIndex
DROP INDEX "RefreshToken_tokenId_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "altText",
DROP COLUMN "checksum",
DROP COLUMN "extension",
DROP COLUMN "height",
DROP COLUMN "path",
DROP COLUMN "storedName",
DROP COLUMN "uploadedAt",
DROP COLUMN "width",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "key" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FloristCompensationRule" ADD COLUMN     "variantId" INTEGER;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "variantId" INTEGER,
ADD COLUMN     "variantName" TEXT,
ADD COLUMN     "variantType" "ProductVariantType";

-- AlterTable
ALTER TABLE "OrderOffer" DROP COLUMN "compensationAmount",
ADD COLUMN     "subtotal" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "taxAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "total" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "OrderOfferItem" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OrderReview" DROP COLUMN "comment",
ADD COLUMN     "comments" TEXT,
ADD COLUMN     "overallRating" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "OrderStatusHistory" DROP COLUMN "fromStatus",
DROP COLUMN "reason",
DROP COLUMN "toStatus",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "status" "OrderStatus" NOT NULL;

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "isPrimary";

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "tokenId";

-- AlterTable
ALTER TABLE "TaxCode" DROP COLUMN "name",
ADD COLUMN     "description" TEXT;

-- DropTable
DROP TABLE "OrderReviewRating";

-- CreateTable
CREATE TABLE "FloristComponentCompensationRule" (
    "id" SERIAL NOT NULL,
    "floristId" INTEGER NOT NULL,
    "componentId" INTEGER NOT NULL,
    "compensationPerAdditionalUnit" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FloristComponentCompensationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemComponent" (
    "id" SERIAL NOT NULL,
    "orderItemId" INTEGER NOT NULL,
    "componentId" INTEGER NOT NULL,
    "componentName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "additionalUnits" INTEGER NOT NULL,
    "customerPricePerAdditionalUnit" DECIMAL(10,2) NOT NULL,
    "customerTotalPrice" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItemComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderOfferItemComponent" (
    "id" SERIAL NOT NULL,
    "orderOfferItemId" INTEGER NOT NULL,
    "componentId" INTEGER NOT NULL,
    "componentName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "additionalUnits" INTEGER NOT NULL,
    "compensationPerAdditionalUnit" DECIMAL(10,2) NOT NULL,
    "totalCompensation" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderOfferItemComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderReviewCategoryRating" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "category" "ReviewCategory" NOT NULL,
    "rating" INTEGER NOT NULL,

    CONSTRAINT "OrderReviewCategoryRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FloristComponentCompensationRule_floristId_idx" ON "FloristComponentCompensationRule"("floristId");

-- CreateIndex
CREATE INDEX "FloristComponentCompensationRule_componentId_idx" ON "FloristComponentCompensationRule"("componentId");

-- CreateIndex
CREATE INDEX "FloristComponentCompensationRule_active_idx" ON "FloristComponentCompensationRule"("active");

-- CreateIndex
CREATE INDEX "FloristComponentCompensationRule_deletedAt_idx" ON "FloristComponentCompensationRule"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "FloristComponentCompensationRule_floristId_componentId_key" ON "FloristComponentCompensationRule"("floristId", "componentId");

-- CreateIndex
CREATE INDEX "OrderItemComponent_orderItemId_idx" ON "OrderItemComponent"("orderItemId");

-- CreateIndex
CREATE INDEX "OrderItemComponent_componentId_idx" ON "OrderItemComponent"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItemComponent_orderItemId_componentId_key" ON "OrderItemComponent"("orderItemId", "componentId");

-- CreateIndex
CREATE INDEX "OrderOfferItemComponent_orderOfferItemId_idx" ON "OrderOfferItemComponent"("orderOfferItemId");

-- CreateIndex
CREATE INDEX "OrderOfferItemComponent_componentId_idx" ON "OrderOfferItemComponent"("componentId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderOfferItemComponent_orderOfferItemId_componentId_key" ON "OrderOfferItemComponent"("orderOfferItemId", "componentId");

-- CreateIndex
CREATE INDEX "OrderReviewCategoryRating_category_idx" ON "OrderReviewCategoryRating"("category");

-- CreateIndex
CREATE UNIQUE INDEX "OrderReviewCategoryRating_reviewId_category_key" ON "OrderReviewCategoryRating"("reviewId", "category");

-- CreateIndex
CREATE INDEX "File_provider_idx" ON "File"("provider");

-- CreateIndex
CREATE INDEX "FloristCompensationRule_variantId_idx" ON "FloristCompensationRule"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "FloristCompensationRule_floristId_productId_variantId_key" ON "FloristCompensationRule"("floristId", "productId", "variantId");

-- CreateIndex
CREATE INDEX "Order_assignedFloristId_idx" ON "Order"("assignedFloristId");

-- CreateIndex
CREATE INDEX "OrderItem_variantId_idx" ON "OrderItem"("variantId");

-- CreateIndex
CREATE INDEX "OrderReview_customerId_idx" ON "OrderReview"("customerId");

-- CreateIndex
CREATE INDEX "OrderReview_floristId_idx" ON "OrderReview"("floristId");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_status_idx" ON "OrderStatusHistory"("status");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- AddForeignKey
ALTER TABLE "FloristCompensationRule" ADD CONSTRAINT "FloristCompensationRule_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloristComponentCompensationRule" ADD CONSTRAINT "FloristComponentCompensationRule_floristId_fkey" FOREIGN KEY ("floristId") REFERENCES "Florist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloristComponentCompensationRule" ADD CONSTRAINT "FloristComponentCompensationRule_componentId_fkey" FOREIGN KEY ("componentId") REFERENCES "ProductComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemComponent" ADD CONSTRAINT "OrderItemComponent_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderOfferItemComponent" ADD CONSTRAINT "OrderOfferItemComponent_orderOfferItemId_fkey" FOREIGN KEY ("orderOfferItemId") REFERENCES "OrderOfferItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderReview" ADD CONSTRAINT "OrderReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderReviewCategoryRating" ADD CONSTRAINT "OrderReviewCategoryRating_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "OrderReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
