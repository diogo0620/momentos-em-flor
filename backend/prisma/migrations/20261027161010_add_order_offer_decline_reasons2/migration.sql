/*
  Warnings:

  - You are about to drop the column `canceledAt` on the `OrderOffer` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "OrderOffer" DROP COLUMN "canceledAt",
ADD COLUMN     "cancelledAt" TIMESTAMP(3);
