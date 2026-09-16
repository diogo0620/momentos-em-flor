
import { PrismaClient, ProductVariantType, FileProvider } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function cleanDatabase() {
  console.log('🧹 Cleaning database...');

  await prisma.orderReviewRating.deleteMany();
  await prisma.orderReview.deleteMany();
  await prisma.orderOfferItemComponent.deleteMany();
  await prisma.orderOfferItem.deleteMany();
  await prisma.orderOffer.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItemComponent.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.file.deleteMany();
  await prisma.floristComponentCompensationRule.deleteMany();
  await prisma.floristCompensationRule.deleteMany();
  await prisma.productComponent.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.florist.deleteMany();
  await prisma.address.deleteMany();
  await prisma.category.deleteMany();
  await prisma.taxCode.deleteMany();

  console.log('✅ Database cleaned.');
}

async function createTaxCodes() {
  console.log('💶 Creating tax codes...');

  const vat23 = await prisma.taxCode.create({
    data: {
      code: 'PT_VAT_23',
      name: 'IVA Normal (23%)',
      rate: 23.00,
    },
  });

  const vat13 = await prisma.taxCode.create({
    data: {
      code: 'PT_VAT_13',
      name: 'IVA Intermédio (13%)',
      rate: 13.00,
    },
  });

  const vat6 = await prisma.taxCode.create({
    data: {
      code: 'PT_VAT_6',
      name: 'IVA Reduzido (6%)',
      rate: 6.00,
    },
  });

  return { vat23, vat13, vat6 };
}

async function createCategories() {
  console.log('📂 Creating categories...');

  const bouquets = await prisma.category.create({
    data: {
      name: 'Bouquets',
      slug: 'bouquets',
      description: 'Ramos e bouquets de flores.',
      sortOrder: 0,
    },
  });

  const plants = await prisma.category.create({
    data: {
      name: 'Plantas',
      slug: 'plantas',
      description: 'Plantas naturais e vasos.',
      sortOrder: 1,
    },
  });

  const funeral = await prisma.category.create({
    data: {
      name: 'Funerais',
      slug: 'funerais',
      description: 'Coroas e arranjos funerários.',
      sortOrder: 2,
    },
  });

  return { bouquets, plants, funeral };
}

async function createFile(
  originalName: string,
  storedName: string,
  path: string,
  altText: string,
) {
  return prisma.file.create({
    data: {
      originalName,
      storedName,
      extension: 'jpg',
      mimeType: 'image/jpeg',
      size: 150000,
      path,
      altText,
      provider: FileProvider.LOCAL,
      width: 1200,
      height: 1200,
    },
  });
}

async function createProductImage(productId: number, fileId: number, options?: { variantId?: number; altText?: string; sortOrder?: number }) {
  return prisma.productImage.create({
    data: {
      productId,
      fileId,
      variantId: options?.variantId,
      altText: options?.altText,
      sortOrder: options?.sortOrder ?? 0,
    },
  });
}

async function createProductComponent(productId: number, data: { name: string; minQuantity: number; recommendedQuantity: number; maxQuantity: number; customerPricePerAdditionalUnit: number; floristCompensationPerAdditionalUnit: number; sortOrder?: number }) {
  return prisma.productComponent.create({
    data: {
      productId,
      name: data.name,
      minQuantity: data.minQuantity,
      recommendedQuantity: data.recommendedQuantity,
      maxQuantity: data.maxQuantity,
      customerPricePerAdditionalUnit: data.customerPricePerAdditionalUnit,
      floristCompensationPerAdditionalUnit: data.floristCompensationPerAdditionalUnit,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

async function createProductVariant(productId: number, data: { type: ProductVariantType; name: string; code?: string; price: number; floristCompensation: number; sortOrder?: number }) {
  return prisma.productVariant.create({
    data: {
      productId,
      type: data.type,
      name: data.name,
      code: data.code,
      price: data.price,
      floristCompensation: data.floristCompensation,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

async function createProducts(taxCodes: Awaited<ReturnType<typeof createTaxCodes>>, categories: Awaited<ReturnType<typeof createCategories>>) {
  console.log('🌸 Creating products...');

  const orchid = await prisma.product.create({
    data: {
      name: 'Orquídea Branca',
      slug: 'orquidea-branca',
      description: 'Orquídea branca em vaso decorativo.',
      basePrice: 34.90,
      baseFloristCompensation: 25.00,
      taxCodeId: taxCodes.vat23.id,
      categoryId: categories.plants.id,
      sortOrder: 0,
    },
  });

  const primavera = await prisma.product.create({
    data: {
      name: 'Ramo Primavera',
      slug: 'ramo-primavera',
      description: 'Ramo colorido de flores da estação, personalizável em quantidade.',
      basePrice: 39.90,
      baseFloristCompensation: 30.00,
      taxCodeId: taxCodes.vat23.id,
      categoryId: categories.bouquets.id,
      sortOrder: 1,
    },
  });

  const primaveraRoses = await createProductComponent(primavera.id, {
    name: 'Rosas',
    minQuantity: 6,
    recommendedQuantity: 12,
    maxQuantity: 24,
    customerPricePerAdditionalUnit: 2.50,
    floristCompensationPerAdditionalUnit: 1.50,
    sortOrder: 0,
  });

  const primaveraPeonies = await createProductComponent(primavera.id, {
    name: 'Peónias',
    minQuantity: 3,
    recommendedQuantity: 6,
    maxQuantity: 12,
    customerPricePerAdditionalUnit: 3.50,
    floristCompensationPerAdditionalUnit: 2.00,
    sortOrder: 1,
  });

  const redRoses = await prisma.product.create({
    data: {
      name: 'Rosas Vermelhas',
      slug: 'rosas-vermelhas',
      description: 'Bouquet de rosas vermelhas frescas, personalizável em quantidade.',
      basePrice: 39.90,
      baseFloristCompensation: 30.00,
      taxCodeId: taxCodes.vat23.id,
      categoryId: categories.bouquets.id,
      sortOrder: 2,
    },
  });

  const redRosesComponent = await createProductComponent(redRoses.id, {
    name: 'Rosas Vermelhas',
    minQuantity: 6,
    recommendedQuantity: 12,
    maxQuantity: 24,
    customerPricePerAdditionalUnit: 2.50,
    floristCompensationPerAdditionalUnit: 1.50,
    sortOrder: 0,
  });

  const crown = await prisma.product.create({
    data: {
      name: 'Coroa Floral',
      slug: 'coroa-floral',
      description: 'Coroa floral disponível em diferentes tamanhos.',
      basePrice: 59.90,
      baseFloristCompensation: 45.00,
      taxCodeId: taxCodes.vat23.id,
      categoryId: categories.funeral.id,
      sortOrder: 3,
    },
  });

  const crownSmall = await createProductVariant(crown.id, {
    type: ProductVariantType.SIZE,
    name: 'Pequena',
    code: 'COROA-S',
    price: 59.90,
    floristCompensation: 45.00,
    sortOrder: 0,
  });

  const crownMedium = await createProductVariant(crown.id, {
    type: ProductVariantType.SIZE,
    name: 'Média',
    code: 'COROA-M',
    price: 79.90,
    floristCompensation: 60.00,
    sortOrder: 1,
  });

  const crownLarge = await createProductVariant(crown.id, {
    type: ProductVariantType.SIZE,
    name: 'Grande',
    code: 'COROA-L',
    price: 109.90,
    floristCompensation: 82.00,
    sortOrder: 2,
  });

  return {
    orchid,
    primavera,
    primaveraRoses,
    primaveraPeonies,
    redRoses,
    redRosesComponent,
    crown,
    crownSmall,
    crownMedium,
    crownLarge,
  };
}

async function createProductImages(products: Awaited<ReturnType<typeof createProducts>>) {
  console.log('🖼️ Creating product images...');

  const primaveraFile = await createFile('ramo-primavera.jpg', 'ramo-primavera.jpg', '/products/ramo-primavera.jpg', 'Ramo Primavera');

  await createProductImage(products.primavera.id, primaveraFile.id, {
    altText: 'Ramo Primavera',
    sortOrder: 0,
  });

  const orchidFile = await createFile('orquidea-branca.jpg', 'orquidea-branca.jpg', '/products/orquidea-branca.jpg', 'Orquídea Branca');

  await createProductImage(products.orchid.id, orchidFile.id, {
    altText: 'Orquídea Branca',
    sortOrder: 0,
  });

  const rosesFile = await createFile('rosas-vermelhas.jpg', 'rosas-vermelhas.jpg', '/products/rosas-vermelhas.jpg', 'Rosas Vermelhas');

  await createProductImage(products.redRoses.id, rosesFile.id, {
    altText: 'Rosas Vermelhas',
    sortOrder: 0,
  });

  const crownGeneralFile = await createFile('coroa-floral.jpg', 'coroa-floral.jpg', '/products/coroa-floral.jpg', 'Coroa Floral');

  await createProductImage(products.crown.id, crownGeneralFile.id, {
    altText: 'Coroa Floral',
    sortOrder: 0,
  });

  const crownSmallFile = await createFile('coroa-pequena.jpg', 'coroa-pequena.jpg', '/products/coroa-pequena.jpg', 'Coroa Floral Pequena');

  await createProductImage(products.crown.id, crownSmallFile.id, {
    variantId: products.crownSmall.id,
    altText: 'Coroa Floral Pequena',
    sortOrder: 0,
  });

  const crownMediumFile = await createFile('coroa-media.jpg', 'coroa-media.jpg', '/products/coroa-media.jpg', 'Coroa Floral Média');

  await createProductImage(products.crown.id, crownMediumFile.id, {
    variantId: products.crownMedium.id,
    altText: 'Coroa Floral Média',
    sortOrder: 0,
  });

  const crownLargeFile = await createFile('coroa-grande.jpg', 'coroa-grande.jpg', '/products/coroa-grande.jpg', 'Coroa Floral Grande');

  await createProductImage(products.crown.id, crownLargeFile.id, {
    variantId: products.crownLarge.id,
    altText: 'Coroa Floral Grande',
    sortOrder: 0,
  });
}

async function createAddress() {
  console.log('📍 Creating address...');

  return prisma.address.create({
    data: {
      street: 'Rua das Flores 123',
      postalCode: '4700-000',
      city: 'Braga',
      district: 'Braga',
      countryCode: 'PT',
      latitude: 41.545400,
      longitude: -8.426500,
      notes: 'Morada de teste da florista.',
    },
  });
}

async function createFlorist(addressId: number) {
  console.log('🌷 Creating florist...');

  return prisma.florist.create({
    data: {
      name: 'Momentos em Flor Braga',
      legalName: 'Momentos em Flor Braga, Lda.',
      taxNumber: '999999990',
      email: 'braga@momentosemflor.pt',
      phone: '+351253000000',
      website: 'https://momentosemflor.pt',
      description: 'Florista parceira de Braga.',
      deliveryRadiusKm: 20,
      addressId,
    },
  });
}

async function createCompensationRules(floristId: number, products: Awaited<ReturnType<typeof createProducts>>) {
  console.log('💰 Creating florist compensation rules...');

  /*
   * Product-level exception.
   *
   * Orquídea:
   * Default compensation = 25.00 €
   * Florist exception = 28.00 €
   */
  await prisma.floristCompensationRule.create({
    data: {
      floristId,
      productId: products.orchid.id,
      compensationAmount: 28.00,
    },
  });

  /*
   * Variant-level exception.
   *
   * Coroa Média:
   * Default compensation = 60.00 €
   * Florist exception = 65.00 €
   */
  await prisma.floristCompensationRule.create({
    data: {
      floristId,
      productId: products.crown.id,
      variantId: products.crownMedium.id,
      compensationAmount: 65.00,
    },
  });

  /*
   * Component-level exception.
   *
   * Ramo Primavera / Rosas:
   * Default = 1.50 € per additional unit
   * Florist exception = 2.00 € per additional unit
   */
  await prisma.floristComponentCompensationRule.create({
    data: {
      floristId,
      componentId: products.primaveraRoses.id,
      compensationPerAdditionalUnit: 2.00,
    },
  });
}

async function createUsers(floristId: number) {
  console.log('👤 Creating users...');

  const adminPasswordHash = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Diogo',
      lastName: 'Silva',
      email: 'admin@momentosemflor.pt',
      passwordHash: adminPasswordHash,
      role: 'SYSTEM_ADMIN',
      active: true,
      emailVerified: true,
    },
  });

  const floristPasswordHash = await bcrypt.hash('Florist123!', 10);

  const floristUser = await prisma.user.create({
    data: {
      firstName: 'Florista',
      lastName: 'Braga',
      email: 'florist@momentosemflor.pt',
      passwordHash: floristPasswordHash,
      role: 'FLORIST',
      floristId,
      active: true,
      emailVerified: true,
    },
  });

  const customerPasswordHash = await bcrypt.hash('Customer123!', 12);

  const customer = await prisma.user.create({
    data: {
      firstName: 'João',
      lastName: 'Silva',
      email: 'customer@momentosemflor.pt',
      passwordHash: customerPasswordHash,
      phone: '910000000',
      role: 'CUSTOMER',
      active: true,
      emailVerified: true,
    },
  });

  return { admin, floristUser, customer };
}

async function main() {
  console.log('');
  console.log('🌱 Starting database seed...');
  console.log('');

  await cleanDatabase();

  const taxCodes = await createTaxCodes();
  const categories = await createCategories();
  const products = await createProducts(taxCodes, categories);

  await createProductImages(products);

  const address = await createAddress();
  const florist = await createFlorist(address.id);

  await createCompensationRules(florist.id, products);

  const users = await createUsers(florist.id);

  console.log('');
  console.log('==========================================');
  console.log('✅ Database seeded successfully!');
  console.log('==========================================');
  console.log('');

  console.log('Products:');
  console.log(`  - ${products.orchid.name}`);
  console.log(`  - ${products.primavera.name} (components)`);
  console.log(`  - ${products.redRoses.name} (component)`);
  console.log(`  - ${products.crown.name} (variants)`);

  console.log('');
  console.log('Compensation rules:');
  console.log('  - Orquídea Branca: 28.00 € for florist');
  console.log('  - Coroa Floral Média: 65.00 € for florist');
  console.log('  - Ramo Primavera / Rosas: 2.00 € per additional unit');

  console.log('');
  console.log('Users:');
  console.log(`  Admin: ${users.admin.email}`);
  console.log(`  Florist: ${users.floristUser.email}`);
  console.log(`  Customer: ${users.customer.email}`);
  console.log('');
}

main()
  .catch((error) => {
    console.error('');
    console.error('❌ Seed failed:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

