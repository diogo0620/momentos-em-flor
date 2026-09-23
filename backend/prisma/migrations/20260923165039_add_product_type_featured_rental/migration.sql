-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('SALE', 'RENTAL');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rentalDeposit" DECIMAL(10,2),
ADD COLUMN     "type" "ProductType" NOT NULL DEFAULT 'SALE';
