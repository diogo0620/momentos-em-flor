// Full seed.ts for Momentos em Flor
import { PrismaClient, ProductType, ProductVariantType, UserRole } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SupabaseStorageService } from '../src/storage/supabase-storage.service';

const prisma = new PrismaClient();
const storage = new SupabaseStorageService(new ConfigService());
const SEED_PASSWORD = 'ChangeMe123!';
const ASSETS_DIR = join(__dirname, 'seed-assets');

type Asset = { file: string; folder: 'categories' | 'products' | 'variants' };
const assets = {
  categories: {
    bouquets: { file: 'categories/bouquets.webp', folder: 'categories' },
    plants: { file: 'categories/plants.webp', folder: 'categories' },
    funeral: { file: 'categories/funerals.webp', folder: 'categories' },
    gifts: { file: 'categories/gifts.webp', folder: 'categories' },
  },
  products: {
    primavera: { file: 'products/bouquet-primavera.webp', folder: 'products' },
    redRoses: { file: 'products/bouquet-rosas-vermelhas.webp', folder: 'products' },
    orchid: { file: 'products/orquidea-branca.webp', folder: 'products' },
    crown: { file: 'products/coroa-floral-classica.webp', folder: 'products' },
    rental: { file: 'products/jarra-decorativa-eventos.webp', folder: 'products' },
  },
  variants: {
    crownSmall: { file: 'variants/coroa-pequena.webp', folder: 'variants' },
    crownMedium: { file: 'variants/coroa-media.webp', folder: 'variants' },
    crownLarge: { file: 'variants/coroa-grande.webp', folder: 'variants' },
  },
} satisfies Record<string, Record<string, Asset>>;

async function replaceImage(asset: Asset, previousPath: string | null, save: (path: string) => Promise<unknown>) {
  const localFile = join(ASSETS_DIR, asset.file);
  if (!existsSync(localFile)) throw new Error(`Imagem em falta: ${localFile}`);
  const extension = asset.file.toLowerCase().endsWith('.png') ? 'png' : 'webp';
  const contentType = extension === 'png' ? 'image/png' : 'image/webp';
  const path = `${asset.folder}/seed-${randomUUID()}.${extension}`;
  await storage.upload(path, readFileSync(localFile), contentType);
  try {
    await save(path);
  } catch (error) {
    try { await storage.remove(path); } catch {}
    throw error;
  }
  if (previousPath && previousPath !== path) {
    try { await storage.remove(previousPath); } catch {}
  }
  return path;
}

async function createTaxCode() {
  return prisma.taxCode.upsert({
    where: { name: 'IVA Normal 23%' },
    update: { description: 'Taxa normal de IVA para Portugal continental.', rate: 23 },
    create: { name: 'IVA Normal 23%', description: 'Taxa normal de IVA para Portugal continental.', rate: 23 },
  });
}

async function createCategories() {
  const definitions = [
    { key: 'bouquets', name: 'Bouquets', slug: 'bouquets', description: 'Ramos e bouquets de flores frescas.' },
    { key: 'plants', name: 'Plantas', slug: 'plantas', description: 'Plantas naturais e arranjos verdes.' },
    { key: 'funeral', name: 'Funerais', slug: 'funerais', description: 'Coroas e arranjos florais para cerimónias fúnebres.' },
    { key: 'gifts', name: 'Presentes', slug: 'presentes', description: 'Flores e presentes para ocasiões especiais.' },
  ] as const;
  const ids: Record<string, number> = {};
  for (const d of definitions) {
    const category = await prisma.category.upsert({
      where: { slug: d.slug },
      update: { name: d.name, description: d.description, active: true },
      create: { name: d.name, slug: d.slug, description: d.description, active: true, imagePath: null },
      select: { id: true, imagePath: true },
    });
    const asset = assets.categories[d.key as keyof typeof assets.categories];
    await replaceImage(asset, category.imagePath, (imagePath) =>
      prisma.category.update({ where: { id: category.id }, data: { imagePath } }),
    );
    ids[d.key] = category.id;
  }
  return { bouquets: { id: ids.bouquets }, plants: { id: ids.plants }, funeral: { id: ids.funeral }, gifts: { id: ids.gifts } };
}

async function createFlorist() {
  const data = {
    name: 'Florista de Demonstração — Porto', legalName: 'Florista de Demonstração, Lda.',
    taxNumber: '999999990', email: 'porto@florista-demo.test', phone: '+351 220 000 000',
    website: 'https://example.com', description: 'Florista de demonstração para desenvolvimento e testes.',
    active: true, acceptingOrders: true, deliveryRadiusKm: 20, addressStreet: 'Rua de Demonstração',
    addressStreetNumber: '100', addressStreet2: null, addressPostalCode: '4000-000',
    addressCity: 'Porto', addressDistrict: 'Porto', addressCountryCode: 'PT',
    addressLatitude: 41.1496, addressLongitude: -8.6109,
  };
  return prisma.florist.upsert({ where: { email: data.email }, update: data, create: data });
}

async function createUsers(floristId: number) {
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);
  const defs = [
    { email: 'admin@bloomery.test', firstName: 'Admin', lastName: 'Bloomery', phone: '+351 910 000 001', role: UserRole.SYSTEM_ADMIN, floristId: null },
    { email: 'florista@bloomery.test', firstName: 'Gestor', lastName: 'Florista Porto', phone: '+351 910 000 002', role: UserRole.FLORIST, floristId },
    { email: 'cliente@bloomery.test', firstName: 'Cliente', lastName: 'Demonstração', phone: '+351 910 000 003', role: UserRole.CUSTOMER, floristId: null },
  ] as const;
  const result: Record<string, { id: number; email: string }> = {};
  for (const d of defs) {
    result[d.email] = await prisma.user.upsert({
      where: { email: d.email },
      update: { ...d, passwordHash, active: true, emailVerified: true },
      create: { ...d, passwordHash, active: true, emailVerified: true },
      select: { id: true, email: true },
    });
  }
  return { admin: result['admin@bloomery.test'], floristUser: result['florista@bloomery.test'], customer: result['cliente@bloomery.test'] };
}

type ComponentSeed = {
  name: string; minQuantity: number; recommendedQuantity: number; maxQuantity: number;
  customerPricePerAdditionalUnit: number; floristPricePerAdditionalUnit: number; active: boolean; sortOrder: number;
};
type VariantSeed = {
  type: ProductVariantType; name: string; description: string; customerPrice: number;
  floristPrice: number; active: boolean; sortOrder: number; asset: Asset;
};
type ProductSeed = {
  name: string; slug: string; description: string; type: ProductType; featured: boolean;
  customerPrice: number; floristPrice: number; rentalDeposit?: number; taxCodeId: number;
  categoryIds: number[]; asset: Asset; components?: ComponentSeed[]; variants?: VariantSeed[];
};

async function upsertProduct(d: ProductSeed) {
  const existing = await prisma.product.findFirst({
    where: {
        OR: [
            { slug: d.slug },
            { name: d.name },
        ],
    },
    select: {
        id: true,
        slug: true,
        name: true,
        imagePath: true,
    },
});
  const scalarData = {
    name: d.name, slug: d.slug, description: d.description, type: d.type, featured: d.featured,
    customerPrice: d.customerPrice, floristPrice: d.floristPrice, rentalDeposit: d.rentalDeposit ?? null,
    taxCodeId: d.taxCodeId, active: false,
  };
  const product = existing
    ? await prisma.product.update({ where: { id: existing.id }, data: { ...scalarData, categories: { set: d.categoryIds.map((id) => ({ id })) } }, select: { id: true, imagePath: true } })
    : await prisma.product.create({ data: { ...scalarData, imagePath: null, categories: { connect: d.categoryIds.map((id) => ({ id })) } }, select: { id: true, imagePath: true } });

  await replaceImage(d.asset, product.imagePath, (imagePath) =>
    prisma.product.update({ where: { id: product.id }, data: { imagePath } }),
  );

  if (d.components) {
    await prisma.productComponent.deleteMany({ where: { productId: product.id } });
    await prisma.productComponent.createMany({ data: d.components.map((c) => ({ ...c, productId: product.id })) });
  }

  if (d.variants) {
    const oldVariants = await prisma.productVariant.findMany({ where: { productId: product.id }, select: { name: true, imagePath: true } });
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    for (const v of d.variants) {
      const old = oldVariants.find((item) => item.name === v.name);
      const created = await prisma.productVariant.create({
        data: {
          type: v.type, name: v.name, description: v.description, customerPrice: v.customerPrice,
          floristPrice: v.floristPrice, active: v.active, sortOrder: v.sortOrder, imagePath: null, productId: product.id,
        },
        select: { id: true },
      });
      await replaceImage(v.asset, old?.imagePath ?? null, (imagePath) =>
        prisma.productVariant.update({ where: { id: created.id }, data: { imagePath } }),
      );
    }
  }

  await prisma.product.update({ where: { id: product.id }, data: { active: true } });
  return { name: d.name, slug: d.slug };
}

async function createProducts(taxCodeId: number, c: Awaited<ReturnType<typeof createCategories>>) {
  const products: ProductSeed[] = [
    {
      name: 'Bouquet Primavera', slug: 'bouquet-primavera',
      description: 'Bouquet colorido com flores da estação, personalizável em quantidade.',
      type: ProductType.SALE, featured: true, customerPrice: 29.9, floristPrice: 19.5,
      taxCodeId, categoryIds: [c.bouquets.id, c.gifts.id], asset: assets.products.primavera,
      components: [
        { name: 'Rosas', minQuantity: 6, recommendedQuantity: 12, maxQuantity: 24, customerPricePerAdditionalUnit: 2.5, floristPricePerAdditionalUnit: 1.5, active: true, sortOrder: 0 },
        { name: 'Peónias', minQuantity: 3, recommendedQuantity: 6, maxQuantity: 12, customerPricePerAdditionalUnit: 3.5, floristPricePerAdditionalUnit: 2, active: true, sortOrder: 1 },
      ],
    },
    {
      name: 'Bouquet de Rosas Vermelhas', slug: 'bouquet-rosas-vermelhas',
      description: 'Ramo clássico de rosas vermelhas, ideal para oferecer.',
      type: ProductType.SALE, featured: true, customerPrice: 34.9, floristPrice: 23,
      taxCodeId, categoryIds: [c.bouquets.id, c.gifts.id], asset: assets.products.redRoses,
      components: [{ name: 'Rosas vermelhas', minQuantity: 6, recommendedQuantity: 12, maxQuantity: 36, customerPricePerAdditionalUnit: 2.5, floristPricePerAdditionalUnit: 1.5, active: true, sortOrder: 0 }],
    },
    {
      name: 'Orquídea Branca', slug: 'orquidea-branca',
      description: 'Orquídea branca num vaso decorativo.', type: ProductType.SALE, featured: false,
      customerPrice: 39.9, floristPrice: 27, taxCodeId, categoryIds: [c.plants.id, c.gifts.id], asset: assets.products.orchid,
    },
    {
      name: 'Coroa Floral Clássica', slug: 'coroa-floral-classica',
      description: 'Coroa floral para cerimónias de homenagem e despedida.', type: ProductType.SALE, featured: false,
      customerPrice: 89, floristPrice: 62, taxCodeId, categoryIds: [c.funeral.id], asset: assets.products.crown,
      variants: [
        { type: ProductVariantType.SIZE, name: 'Pequena', description: 'Coroa floral de tamanho pequeno.', customerPrice: 89, floristPrice: 62, active: true, sortOrder: 0, asset: assets.variants.crownSmall },
        { type: ProductVariantType.SIZE, name: 'Média', description: 'Coroa floral de tamanho médio.', customerPrice: 119, floristPrice: 83, active: true, sortOrder: 1, asset: assets.variants.crownMedium },
        { type: ProductVariantType.SIZE, name: 'Grande', description: 'Coroa floral de tamanho grande.', customerPrice: 159, floristPrice: 111, active: true, sortOrder: 2, asset: assets.variants.crownLarge },
      ],
    },
    {
      name: 'Jarra Decorativa para Eventos', slug: 'jarra-decorativa-eventos',
      description: 'Jarra decorativa disponibilizada para aluguer em eventos.', type: ProductType.RENTAL, featured: false,
      customerPrice: 15, floristPrice: 9, rentalDeposit: 25, taxCodeId,
      categoryIds: [c.gifts.id], asset: assets.products.rental,
    },
  ];
  const result: { name: string; slug: string }[] = [];
  for (const product of products) result.push(await upsertProduct(product));
  return result;
}

async function main() {
  console.log('🌱 Starting Momentos em Flor development seed...');
  const allAssets: Asset[] = [
    ...Object.values(assets.categories), ...Object.values(assets.products), ...Object.values(assets.variants),
  ];
  const missing = allAssets.map((a) => join(ASSETS_DIR, a.file)).filter((file) => !existsSync(file));
  if (missing.length) throw new Error(`Faltam ${missing.length} imagens de seed:\n${missing.map((f) => ` - ${f}`).join('\n')}`);

  const taxCode = await createTaxCode();
  const categories = await createCategories();
  const florist = await createFlorist();
  const users = await createUsers(florist.id);
  const products = await createProducts(taxCode.id, categories);

  console.log('\n✅ Seed concluído.');
  console.log(`Admin: ${users.admin.email}`);
  console.log(`Florista: ${users.floristUser.email}`);
  console.log(`Cliente: ${users.customer.email}`);
  console.log(`Password partilhada: ${SEED_PASSWORD}`);
  products.forEach((p) => console.log(`- ${p.name} (${p.slug})`));
  console.log('⚠️ Apenas para desenvolvimento; não usar estas contas em produção.');
}

main()
  .catch((error) => { console.error('❌ Seed failed:', error); process.exitCode = 1; })
  .finally(async () => { await prisma.$disconnect(); });
