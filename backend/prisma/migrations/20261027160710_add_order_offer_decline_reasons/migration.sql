/*
  Warnings:

  - The `declineReason` column on the `OrderOffer` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "OrderOfferCancellationReason" AS ENUM ('ANOTHER_OFFER_ACCEPTED', 'ORDER_CANCELLED', 'FLORIST_UNAVAILABLE', 'ADMIN_REQUEST', 'OTHER');

-- CreateEnum
CREATE TYPE "OrderOfferDeclineReason" AS ENUM ('PRICE_TOO_LOW', 'DELIVERY_AREA_NOT_COVERED', 'DELIVERY_DATE_UNAVAILABLE', 'PRODUCT_UNAVAILABLE', 'PRODUCT_SPECIFICATION_UNAVAILABLE', 'OTHER');

-- AlterTable
ALTER TABLE "OrderOffer" ADD COLUMN     "cancellationReason" "OrderOfferCancellationReason",
ADD COLUMN     "cancellationReasonDetails" TEXT,
ADD COLUMN     "declineReasonDetails" TEXT,
DROP COLUMN "declineReason",
ADD COLUMN     "declineReason" "OrderOfferDeclineReason";
