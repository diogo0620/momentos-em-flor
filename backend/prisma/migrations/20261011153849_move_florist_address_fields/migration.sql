/*
  Warnings:

  - You are about to drop the column `addressId` on the `Florist` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `addressCity` to the `Florist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressCountryCode` to the `Florist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressDistrict` to the `Florist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressPostalCode` to the `Florist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressStreet` to the `Florist` table without a default value. This is not possible if the table is not empty.
  - Added the required column `addressStreetNumber` to the `Florist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Florist" DROP CONSTRAINT "Florist_addressId_fkey";

-- DropIndex
DROP INDEX "Florist_addressId_key";

-- AlterTable
ALTER TABLE "Florist" DROP COLUMN "addressId",
ADD COLUMN     "addressCity" TEXT NOT NULL,
ADD COLUMN     "addressCountryCode" CHAR(2) NOT NULL,
ADD COLUMN     "addressDistrict" TEXT NOT NULL,
ADD COLUMN     "addressLatitude" DECIMAL(9,6),
ADD COLUMN     "addressLongitude" DECIMAL(9,6),
ADD COLUMN     "addressPostalCode" TEXT NOT NULL,
ADD COLUMN     "addressStreet" TEXT NOT NULL,
ADD COLUMN     "addressStreet2" TEXT,
ADD COLUMN     "addressStreetNumber" TEXT NOT NULL;

-- DropTable
DROP TABLE "Address";
