/*
  Warnings:

  - You are about to drop the column `city` on the `Florist` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `Florist` table. All the data in the column will be lost.
  - You are about to drop the column `district` on the `Florist` table. All the data in the column will be lost.
  - You are about to drop the column `latitude` on the `Florist` table. All the data in the column will be lost.
  - You are about to drop the column `longitude` on the `Florist` table. All the data in the column will be lost.
  - You are about to drop the column `postalCode` on the `Florist` table. All the data in the column will be lost.
  - You are about to drop the column `street` on the `Florist` table. All the data in the column will be lost.
  - You are about to drop the column `street2` on the `Florist` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slug]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[addressId]` on the table `Florist` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressId` to the `Florist` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Florist_postalCode_idx";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "slug" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Florist" DROP COLUMN "city",
DROP COLUMN "country",
DROP COLUMN "district",
DROP COLUMN "latitude",
DROP COLUMN "longitude",
DROP COLUMN "postalCode",
DROP COLUMN "street",
DROP COLUMN "street2",
ADD COLUMN     "addressId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "label" TEXT,
    "street" TEXT NOT NULL,
    "street2" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Address_postalCode_idx" ON "Address"("postalCode");

-- CreateIndex
CREATE INDEX "Address_city_idx" ON "Address"("city");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_active_idx" ON "Category"("active");

-- CreateIndex
CREATE UNIQUE INDEX "Florist_addressId_key" ON "Florist"("addressId");

-- AddForeignKey
ALTER TABLE "Florist" ADD CONSTRAINT "Florist_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
