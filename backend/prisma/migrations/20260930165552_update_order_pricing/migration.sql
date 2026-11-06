/*
  Warnings:

  - You are about to drop the column `unitPrice` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `subtotal` on the `OrderOffer` table. All the data in the column will be lost.
  - You are about to drop the column `taxAmount` on the `OrderOffer` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `OrderOffer` table. All the data in the column will be lost.
  - You are about to drop the column `baseFloristCompensation` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `basePrice` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `floristCompensationPerAdditionalUnit` on the `ProductComponent` table. All the data in the column will be lost.
  - You are about to drop the column `floristCompensation` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the `FloristCompensationRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FloristComponentCompensationRule` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderOfferItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderOfferItemComponent` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `customerPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `floristPrice` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `OrderOffer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `floristPrice` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `floristPricePerAdditionalUnit` to the `ProductComponent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPrice` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `floristPrice` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "FloristCompensationRule" DROP CONSTRAINT "FloristCompensationRule_floristId_fkey";

-- DropForeignKey
ALTER TABLE "FloristCompensationRule" DROP CONSTRAINT "FloristCompensationRule_productId_fkey";

-- DropForeignKey
ALTER TABLE "FloristCompensationRule" DROP CONSTRAINT "FloristCompensationRule_variantId_fkey";

-- DropForeignKey
ALTER TABLE "FloristComponentCompensationRule" DROP CONSTRAINT "FloristComponentCompensationRule_componentId_fkey";

-- DropForeignKey
ALTER TABLE "FloristComponentCompensationRule" DROP CONSTRAINT "FloristComponentCompensationRule_floristId_fkey";

-- DropForeignKey
ALTER TABLE "OrderOfferItem" DROP CONSTRAINT "OrderOfferItem_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderOfferItem" DROP CONSTRAINT "OrderOfferItem_orderOfferId_fkey";

-- DropForeignKey
ALTER TABLE "OrderOfferItemComponent" DROP CONSTRAINT "OrderOfferItemComponent_orderOfferItemId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "unitPrice",
ADD COLUMN     "customerPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "floristPrice" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "OrderOffer" DROP COLUMN "subtotal",
DROP COLUMN "taxAmount",
DROP COLUMN "total",
ADD COLUMN     "price" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "baseFloristCompensation",
DROP COLUMN "basePrice",
ADD COLUMN     "customerPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "floristPrice" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "ProductComponent" DROP COLUMN "floristCompensationPerAdditionalUnit",
ADD COLUMN     "floristPricePerAdditionalUnit" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "floristCompensation",
DROP COLUMN "price",
ADD COLUMN     "customerPrice" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "floristPrice" DECIMAL(10,2) NOT NULL;

-- DropTable
DROP TABLE "FloristCompensationRule";

-- DropTable
DROP TABLE "FloristComponentCompensationRule";

-- DropTable
DROP TABLE "OrderOfferItem";

-- DropTable
DROP TABLE "OrderOfferItemComponent";
