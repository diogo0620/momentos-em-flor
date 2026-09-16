/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Florist` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `FloristCompensationRule` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `FloristComponentCompensationRule` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `ProductComponent` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `TaxCode` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Address_deletedAt_idx";

-- DropIndex
DROP INDEX "Category_deletedAt_idx";

-- DropIndex
DROP INDEX "File_deletedAt_idx";

-- DropIndex
DROP INDEX "Florist_deletedAt_idx";

-- DropIndex
DROP INDEX "FloristCompensationRule_deletedAt_idx";

-- DropIndex
DROP INDEX "FloristComponentCompensationRule_deletedAt_idx";

-- DropIndex
DROP INDEX "Order_deletedAt_idx";

-- DropIndex
DROP INDEX "Product_deletedAt_idx";

-- DropIndex
DROP INDEX "ProductComponent_deletedAt_idx";

-- DropIndex
DROP INDEX "ProductImage_deletedAt_idx";

-- DropIndex
DROP INDEX "ProductVariant_deletedAt_idx";

-- DropIndex
DROP INDEX "TaxCode_deletedAt_idx";

-- DropIndex
DROP INDEX "User_deletedAt_idx";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Florist" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "FloristCompensationRule" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "FloristComponentCompensationRule" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "ProductComponent" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "TaxCode" DROP COLUMN "deletedAt";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deletedAt";
