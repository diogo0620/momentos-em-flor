-- CreateTable
CREATE TABLE "Florist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "legalName" TEXT,
    "taxNumber" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "acceptingOrders" BOOLEAN NOT NULL DEFAULT true,
    "deliveryRadiusKm" DECIMAL(5,2) NOT NULL,
    "street" TEXT NOT NULL,
    "street2" TEXT,
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Florist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Florist_taxNumber_key" ON "Florist"("taxNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Florist_email_key" ON "Florist"("email");

-- CreateIndex
CREATE INDEX "Florist_active_idx" ON "Florist"("active");

-- CreateIndex
CREATE INDEX "Florist_acceptingOrders_idx" ON "Florist"("acceptingOrders");

-- CreateIndex
CREATE INDEX "Florist_postalCode_idx" ON "Florist"("postalCode");
