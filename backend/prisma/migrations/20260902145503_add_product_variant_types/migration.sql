/*
  Warnings:

  - A unique constraint covering the columns `[productId,type,name]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[productId,type,code]` on the table `ProductVariant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `type` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductVariantType" AS ENUM ('SIZE');

-- DropIndex
DROP INDEX "ProductVariant_productId_code_key";

-- DropIndex
DROP INDEX "ProductVariant_productId_name_key";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "type" "ProductVariantType" NOT NULL;

-- CreateIndex
CREATE INDEX "ProductVariant_type_idx" ON "ProductVariant"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_type_name_key" ON "ProductVariant"("productId", "type", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_type_code_key" ON "ProductVariant"("productId", "type", "code");
