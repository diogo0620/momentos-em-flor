/*
  Warnings:

  - You are about to drop the column `code` on the `TaxCode` table. All the data in the column will be lost.
  - You are about to drop the column `avatarUrl` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `TaxCode` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `description` to the `TaxCode` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "TaxCode_code_key";

-- AlterTable
ALTER TABLE "TaxCode" DROP COLUMN "code",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "avatarUrl";

-- CreateIndex
CREATE UNIQUE INDEX "TaxCode_name_key" ON "TaxCode"("name");
