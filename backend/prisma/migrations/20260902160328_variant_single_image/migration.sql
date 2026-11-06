/*
  Warnings:

  - A unique constraint covering the columns `[variantId]` on the table `ProductImage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_variantId_key" ON "ProductImage"("variantId");
