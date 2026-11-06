/*
  Warnings:

  - You are about to drop the column `altText` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to drop the column `code` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the `File` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[path]` on the table `ProductImage` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `path` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_fileId_fkey";

-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_variantId_fkey";

-- DropIndex
DROP INDEX "ProductImage_fileId_idx";

-- DropIndex
DROP INDEX "ProductImage_variantId_idx";

-- DropIndex
DROP INDEX "ProductImage_variantId_key";

-- DropIndex
DROP INDEX "ProductVariant_productId_type_code_key";

-- AlterTable
ALTER TABLE "ProductImage" DROP COLUMN "altText",
DROP COLUMN "fileId",
DROP COLUMN "updatedAt",
DROP COLUMN "variantId",
ADD COLUMN     "path" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "code",
ADD COLUMN     "imagePath" TEXT;

-- DropTable
DROP TABLE "File";

-- CreateIndex
CREATE UNIQUE INDEX "ProductImage_path_key" ON "ProductImage"("path");
