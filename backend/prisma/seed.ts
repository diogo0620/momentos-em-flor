import {
  PrismaClient,
  ProductType,
  ProductVariantType,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const SEED_PASSWORD = 'ChangeMe123!';

async function createTaxCode() {
  return prisma.taxCode.create({
    data: {
      name: 'IVA Normal 23%',
      description: 'Taxa normal de IVA para Portugal continental.',
      rate: 23,
    },
  });
}

async function createCategories() {
  const bouquets = await prisma.category.create({
    data: {
      name: 'Bouquets',
      slug: 'bouquets',
      description: 'Ramos e bouquets de flores frescas.',
      active: true,
    },
  });

  const plants = await prisma.category.create({
    data: {
      name: 'Plantas',
      slug: 'plantas',
      description: 'Plantas naturais e arranjos verdes.',
      active: true,
    },
  });

  const funeral = await prisma.category.create({
    data: {
      name: 'Funerais',
      slug: 'funerais',
      description: 'Coroas e arranjos florais para cerimónias fúnebres.',
      active: true,
    },
  });

  const gifts = await prisma.category.create({
    data: {
      name: 'Presentes',
      slug: 'presentes',
      description: 'Flores e presentes para ocasiões especiais.',
      active: true,
    },
  });

  return { bouquets, plants, funeral, gifts };
}

async function createFlorist() {
  return prisma.florist.create({
    data: {
      name: 'Florista de Demonstração — Porto',
      legalName: 'Florista de Demonstração, Lda.',
      taxNumber: '999999990',
      email: 'porto@florista-demo.test',
      phone: '+351 220 000 000',
      website: 'https://example.com',
      description: 'Florista de demonstração para desenvolvimento e testes.',
      active: true,
      acceptingOrders: true,
      deliveryRadiusKm: 20,
      addressStreet: 'Rua de Demonstração',
      addressStreetNumber: '100',
      addressStreet2: null,
      addressPostalCode: '4000-000',
      addressCity: 'Porto',
      addressDistrict: 'Porto',
      addressCountryCode: 'PT',
      addressLatitude: 41.1496,
      addressLongitude: -8.6109,
    },
  });
}

async function createUsers(floristId: number) {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'Bloomery',
      email: 'admin@bloomery.test',
      phone: '+351 910 000 001',
      passwordHash,
      role: UserRole.SYSTEM_ADMIN,
      active: true,
      emailVerified: true,
    },
  });

  const floristUser = await prisma.user.create({
    data: {
      firstName: 'Gestor',
      lastName: 'Florista Porto',
      email: 'florista@bloomery.test',
      phone: '+351 910 000 002',
      passwordHash,
      role: UserRole.FLORIST,
      floristId,
      active: true,
      emailVerified: true,
    },
  });

  const customer = await prisma.user.create({
    data: {
      firstName: 'Cliente',
      lastName: 'Demonstração',
      email: 'cliente@bloomery.test',
      phone: '+351 910 000 003',
      passwordHash,
      role: UserRole.CUSTOMER,
      active: true,
      emailVerified: true,
    },
  });

  return { admin, floristUser, customer };
}

async function createProducts(
  taxCodeId: number,
  categories: Awaited<ReturnType<typeof createCategories>>,
) {
  // Products remain inactive until product and variant images are uploaded.
  const primavera = await prisma.product.create({
    data: {
      name: 'Bouquet Primavera',
      slug: 'bouquet-primavera',
      description: 'Bouquet colorido com flores da estação, personalizável em quantidade.',
      type: ProductType.SALE,
      featured: true,
      customerPrice: 29.9,
      floristPrice: 19.5,
      taxCodeId,
      active: false,
      categories: {
        connect: [{ id: categories.bouquets.id }, { id: categories.gifts.id }],
      },
      components: {
        create: [
          {
            name: 'Rosas',
            minQuantity: 6,
            recommendedQuantity: 12,
            maxQuantity: 24,
            customerPricePerAdditionalUnit: 2.5,
            floristPricePerAdditionalUnit: 1.5,
            active: true,
            sortOrder: 0,
          },
          {
            name: 'Peónias',
            minQuantity: 3,
            recommendedQuantity: 6,
            maxQuantity: 12,
            customerPricePerAdditionalUnit: 3.5,
            floristPricePerAdditionalUnit: 2,
            active: true,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  const redRoses = await prisma.product.create({
    data: {
      name: 'Bouquet de Rosas Vermelhas',
      slug: 'bouquet-rosas-vermelhas',
      description: 'Ramo clássico de rosas vermelhas, ideal para oferecer.',
      type: ProductType.SALE,
      featured: true,
      customerPrice: 34.9,
      floristPrice: 23,
      taxCodeId,
      active: false,
      categories: {
        connect: [{ id: categories.bouquets.id }, { id: categories.gifts.id }],
      },
      components: {
        create: [
          {
            name: 'Rosas vermelhas',
            minQuantity: 6,
            recommendedQuantity: 12,
            maxQuantity: 36,
            customerPricePerAdditionalUnit: 2.5,
            floristPricePerAdditionalUnit: 1.5,
            active: true,
            sortOrder: 0,
          },
        ],
      },
    },
  });

  const orchid = await prisma.product.create({
    data: {
      name: 'Orquídea Branca',
      slug: 'orquidea-branca',
      description: 'Orquídea branca num vaso decorativo.',
      type: ProductType.SALE,
      featured: false,
      customerPrice: 39.9,
      floristPrice: 27,
      taxCodeId,
      active: false,
      categories: {
        connect: [{ id: categories.plants.id }, { id: categories.gifts.id }],
      },
    },
  });

  const crown = await prisma.product.create({
    data: {
      name: 'Coroa Floral Clássica',
      slug: 'coroa-floral-classica',
      description: 'Coroa floral para cerimónias de homenagem e despedida.',
      type: ProductType.SALE,
      featured: false,
      customerPrice: 89,
      floristPrice: 62,
      taxCodeId,
      active: false,
      categories: {
        connect: [{ id: categories.funeral.id }],
      },
      variants: {
        create: [
          {
            type: ProductVariantType.SIZE,
            name: 'Pequena',
            description: 'XX',
            customerPrice: 89,
            floristPrice: 62,
            active: true,
            sortOrder: 0,
            imagePath: null,
          },
          {
            type: ProductVariantType.SIZE,
            name: 'Média',
            description: 'YY',
            customerPrice: 119,
            floristPrice: 83,
            active: true,
            sortOrder: 1,
            imagePath: null,
          },
          {
            type: ProductVariantType.SIZE,
            name: 'Grande',
            description: 'ZZ',
            customerPrice: 159,
            floristPrice: 111,
            active: true,
            sortOrder: 2,
            imagePath: null,
          },
        ],
      },
    },
  });

  const rental = await prisma.product.create({
    data: {
      name: 'Jarra Decorativa para Eventos',
      slug: 'jarra-decorativa-eventos',
      description: 'Jarra decorativa disponibilizada para aluguer em eventos.',
      type: ProductType.RENTAL,
      featured: false,
      customerPrice: 15,
      floristPrice: 9,
      rentalDeposit: 25,
      taxCodeId,
      active: false,
      categories: {
        connect: [{ id: categories.gifts.id }],
      },
    },
  });

  return { primavera, redRoses, orchid, crown, rental };
}

async function main() {
  console.log('🌱 Starting Bloomery development seed...');

  const taxCode = await createTaxCode();
  const categories = await createCategories();
  const florist = await createFlorist();
  const users = await createUsers(florist.id);
  const products = await createProducts(taxCode.id, categories);

  console.log('\n✅ Seed completed.');
  console.log('\nDevelopment accounts (shared password):');
  console.log(`  Admin:   ${users.admin.email}`);
  console.log(`  Florist: ${users.floristUser.email}`);
  console.log(`  Client:  ${users.customer.email}`);
  console.log(`  Password: ${SEED_PASSWORD}`);
  console.log('\nProducts created inactive until images are uploaded:');
  Object.values(products).forEach((product) => {
    console.log(`  - ${product.name} (${product.slug})`);
  });
  console.log('\n⚠️ Development seed only. Do not use these accounts or passwords in production.');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
