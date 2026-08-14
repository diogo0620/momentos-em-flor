/*
  Warnings:

  - Made the column `floristId` on table `FloristCompensationRule` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `baseFloristCompensation` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FloristCompensationRule" ALTER COLUMN "floristId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "baseFloristCompensation" DECIMAL(10,2) NOT NULL;
