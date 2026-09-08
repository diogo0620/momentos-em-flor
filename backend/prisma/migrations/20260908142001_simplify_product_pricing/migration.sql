/*
  Warnings:

  - You are about to drop the column `pricingType` on the `Product` table. All the data in the column will be lost.
  - Made the column `basePrice` on table `Product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `baseFloristCompensation` on table `Product` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "pricingType",
ALTER COLUMN "basePrice" SET NOT NULL,
ALTER COLUMN "baseFloristCompensation" SET NOT NULL;

-- DropEnum
DROP TYPE "ProductPricingType";
