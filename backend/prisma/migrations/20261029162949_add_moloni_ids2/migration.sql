/*
  Warnings:

  - The `moloniId` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `moloniId` column on the `TaxCode` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "Product_moloniId_key";

-- DropIndex
DROP INDEX "TaxCode_moloniId_key";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "moloniId",
ADD COLUMN     "moloniId" INTEGER;

-- AlterTable
ALTER TABLE "TaxCode" DROP COLUMN "moloniId",
ADD COLUMN     "moloniId" INTEGER;
