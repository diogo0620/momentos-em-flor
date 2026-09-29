-- AlterTable
ALTER TABLE "StoreSettings" ALTER COLUMN "id" SET DEFAULT 1,
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "StoreSettings_id_seq";
