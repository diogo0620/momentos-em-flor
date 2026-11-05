ALTER TABLE "StoreSettings"
ADD COLUMN "deliveryAreaEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "deliveryAreaName" TEXT NOT NULL DEFAULT 'Santa Maria da Feira e arredores',
ADD COLUMN "deliveryCenterLatitude" DECIMAL(9,6) NOT NULL DEFAULT 40.924574,
ADD COLUMN "deliveryCenterLongitude" DECIMAL(9,6) NOT NULL DEFAULT -8.543956,
ADD COLUMN "deliveryRadiusKm" DECIMAL(8,2) NOT NULL DEFAULT 15;
