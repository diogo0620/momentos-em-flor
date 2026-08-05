import {
  PrismaClient,
  ProductPricingType,
} from '@prisma/client';

import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  /*
   * Limpar dados
   * (ordem importante por causa das foreign keys)
   */
  await prisma.florist.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  /*
   * Categories
   */
  const bouquets = await prisma.category.create({
    data: {
      name: 'Bouquets',
      slug: 'bouquets',
      description: 'Ramos de flores.',
    },
  });

  const plants = await prisma.category.create({
    data: {
      name: 'Plantas',
      slug: 'plantas',
      description: 'Plantas naturais.',
    },
  });

  /*
   * Products
   */
  await prisma.product.create({
    data: {
      name: 'Ramo Primavera',
      slug: 'ramo-primavera',
      description: 'Ramo colorido de flores da estação.',
      pricingType: ProductPricingType.FIXED,
      basePrice: 29.90,
      categoryId: bouquets.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Rosas Vermelhas',
      slug: 'rosas-vermelhas',
      description: 'Bouquet de rosas vermelhas.',
      pricingType: ProductPricingType.FIXED,
      basePrice: 39.90,
      categoryId: bouquets.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Orquídea Branca',
      slug: 'orquidea-branca',
      description: 'Orquídea branca em vaso.',
      pricingType: ProductPricingType.FIXED,
      basePrice: 34.90,
      categoryId: plants.id,
    },
  });

  /*
   * Address
   */
  const address = await prisma.address.create({
    data: {
      street: 'Rua das Flores 123',
      postalCode: '4700-000',
      city: 'Braga',
      district: 'Braga',
      countryCode: 'PT',
      latitude: 41.5454,
      longitude: -8.4265,
    },
  });

  /*
   * Florist
   */
  await prisma.florist.create({
    data: {
      name: 'Momentos em Flor Braga',
      legalName: 'Momentos em Flor Braga, Lda.',
      taxNumber: '999999990',
      email: 'braga@momentosemflor.pt',
      phone: '+351253000000',
      website: 'https://momentosemflor.pt',
      description: 'Florista parceira de Braga.',
      deliveryRadiusKm: 20,
      addressId: address.id,
    },
  });

  const passwordHash = await bcrypt.hash('Admin123!', 10);
  await prisma.user.create({
  data: {
    firstName: 'Diogo',
    lastName: 'Silva',
    email: 'admin@momentosemflor.pt',
    passwordHash,
    role: 'SYSTEM_ADMIN',
    floristId: null,
  },
});

  console.log('✅ Database seeded successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });