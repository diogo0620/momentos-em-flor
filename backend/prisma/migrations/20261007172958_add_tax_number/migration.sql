/*
  Warnings:

  - You are about to drop the column `notes` on the `Address` table. All the data in the column will be lost.
  - Added the required column `streetNumber` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deliveryStreetNumber` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Made the column `customerLastName` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customerEmail` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Made the column `customerPhone` on table `Order` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `taxNumber` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Address" DROP COLUMN "notes",
ADD COLUMN     "streetNumber" TEXT NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerTaxNumber" TEXT,
ADD COLUMN     "deliveryStreetNumber" TEXT NOT NULL,
ALTER COLUMN "customerLastName" SET NOT NULL,
ALTER COLUMN "customerEmail" SET NOT NULL,
ALTER COLUMN "customerPhone" SET NOT NULL,
ALTER COLUMN "deliveryLatitude" DROP NOT NULL,
ALTER COLUMN "deliveryLongitude" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "taxNumber" TEXT NOT NULL,
ALTER COLUMN "phone" SET NOT NULL;
