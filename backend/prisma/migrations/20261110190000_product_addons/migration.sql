CREATE TABLE "ProductAddon" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "addonProductId" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ProductAddon_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ProductAddon_productId_addonProductId_key" ON "ProductAddon"("productId", "addonProductId");
CREATE INDEX "ProductAddon_productId_active_sortOrder_idx" ON "ProductAddon"("productId", "active", "sortOrder");
CREATE INDEX "ProductAddon_addonProductId_idx" ON "ProductAddon"("addonProductId");
ALTER TABLE "ProductAddon" ADD CONSTRAINT "ProductAddon_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductAddon" ADD CONSTRAINT "ProductAddon_addonProductId_fkey" FOREIGN KEY ("addonProductId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
