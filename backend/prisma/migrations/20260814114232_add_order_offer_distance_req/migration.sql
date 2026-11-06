/*
  Warnings:

  - Made the column `distanceKm` on table `OrderOffer` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "OrderOffer" ALTER COLUMN "distanceKm" SET NOT NULL;
