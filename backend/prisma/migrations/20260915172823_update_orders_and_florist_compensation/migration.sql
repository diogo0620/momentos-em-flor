/*
  Warnings:

  - You are about to drop the column `createdAt` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `key` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `comments` on the `OrderReview` table. All the data in the column will be lost.
  - You are about to drop the column `overallRating` on the `OrderReview` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `OrderStatusHistory` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `OrderStatusHistory` table. All the data in the column will be lost.
  - You are about to drop the `OrderReviewCategoryRating` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[checksum]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenId]` on the table `RefreshToken` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `extension` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storedName` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toStatus` to the `OrderStatusHistory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tokenId` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PricingMarginType" AS ENUM ('FIXED_AMOUNT', 'PERCENTAGE', 'FIXED_PRICE');

-- DropForeignKey
ALTER TABLE "OrderReview" DROP CONSTRAINT "OrderReview_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderReviewCategoryRating" DROP CONSTRAINT "OrderReviewCategoryRating_reviewId_fkey";

-- DropIndex
DROP INDEX "File_provider_idx";

-- DropIndex
DROP INDEX "OrderReview_customerId_idx";

-- DropIndex
DROP INDEX "OrderReview_floristId_idx";

-- DropIndex
DROP INDEX "OrderStatusHistory_status_idx";

-- DropIndex
DROP INDEX "RefreshToken_tokenHash_key";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "createdAt",
DROP COLUMN "key",
DROP COLUMN "updatedAt",
DROP COLUMN "url",
ADD COLUMN     "altText" TEXT,
ADD COLUMN     "checksum" TEXT,
ADD COLUMN     "extension" TEXT NOT NULL,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "path" TEXT NOT NULL,
ADD COLUMN     "storedName" TEXT NOT NULL,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "width" INTEGER;

-- AlterTable
ALTER TABLE "OrderReview" DROP COLUMN "comments",
DROP COLUMN "overallRating",
ADD COLUMN     "comment" TEXT;

-- AlterTable
ALTER TABLE "OrderStatusHistory" DROP COLUMN "notes",
DROP COLUMN "status",
ADD COLUMN     "fromStatus" "OrderStatus",
ADD COLUMN     "reason" TEXT,
ADD COLUMN     "toStatus" "OrderStatus" NOT NULL;

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "RefreshToken" ADD COLUMN     "tokenId" TEXT NOT NULL;

-- DropTable
DROP TABLE "OrderReviewCategoryRating";

-- CreateTable
CREATE TABLE "OrderReviewRating" (
    "id" SERIAL NOT NULL,
    "reviewId" INTEGER NOT NULL,
    "category" "ReviewCategory" NOT NULL,
    "rating" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderReviewRating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderReviewRating_reviewId_category_key" ON "OrderReviewRating"("reviewId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "File_checksum_key" ON "File"("checksum");

-- CreateIndex
CREATE INDEX "OrderStatusHistory_createdAt_idx" ON "OrderStatusHistory"("createdAt");

-- CreateIndex
CREATE INDEX "ProductImage_variantId_idx" ON "ProductImage"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_tokenId_key" ON "RefreshToken"("tokenId");

-- CreateIndex
CREATE INDEX "RefreshToken_revokedAt_idx" ON "RefreshToken"("revokedAt");

-- AddForeignKey
ALTER TABLE "OrderReview" ADD CONSTRAINT "OrderReview_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderReviewRating" ADD CONSTRAINT "OrderReviewRating_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "OrderReview"("id") ON DELETE CASCADE ON UPDATE CASCADE;
