/*
  Warnings:

  - The values [FLORIST_UNAVAILABLE,ADMIN_REQUEST,OTHER] on the enum `OrderOfferCancellationReason` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `cancellationReasonDetails` on the `OrderOffer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[moloniId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[moloniId]` on the table `TaxCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `moloniId` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `moloniId` to the `TaxCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderOfferCancellationReason_new" AS ENUM ('ANOTHER_OFFER_ACCEPTED', 'ORDER_CANCELLED');
ALTER TABLE "OrderOffer" ALTER COLUMN "cancellationReason" TYPE "OrderOfferCancellationReason_new" USING ("cancellationReason"::text::"OrderOfferCancellationReason_new");
ALTER TYPE "OrderOfferCancellationReason" RENAME TO "OrderOfferCancellationReason_old";
ALTER TYPE "OrderOfferCancellationReason_new" RENAME TO "OrderOfferCancellationReason";
DROP TYPE "public"."OrderOfferCancellationReason_old";
COMMIT;

-- AlterTable
ALTER TABLE "OrderOffer" DROP COLUMN "cancellationReasonDetails";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "moloniId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "TaxCode" ADD COLUMN     "moloniId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_moloniId_key" ON "Product"("moloniId");

-- CreateIndex
CREATE UNIQUE INDEX "TaxCode_moloniId_key" ON "TaxCode"("moloniId");
