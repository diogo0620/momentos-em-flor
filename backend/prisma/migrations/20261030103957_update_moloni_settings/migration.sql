-- AlterTable
ALTER TABLE "MoloniSettings" ADD COLUMN     "connected" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastConnectionCheckAt" TIMESTAMP(3),
ADD COLUMN     "lastConnectionError" TEXT;
