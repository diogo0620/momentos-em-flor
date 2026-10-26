/*
  Warnings:

  - You are about to drop the column `image` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the `ProductImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductImage" DROP CONSTRAINT "ProductImage_productId_fkey";

-- AlterTable
ALTER TABLE "Category" DROP COLUMN "image",
ADD COLUMN     "imagePath" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "imagePath" TEXT;

-- DropTable
DROP TABLE "ProductImage";
