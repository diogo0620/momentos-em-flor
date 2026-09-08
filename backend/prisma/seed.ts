
import {
  PrismaClient,
  ProductVariantType,
  FileProvider,
} from '@prisma/client';

import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/*
 * ============================================================
 * HELPERS
 * ============================================================
 */

async function cleanDatabase() {
  console.log('🧹 Cleaning database...');

  await prisma.orderReviewRating.deleteMany();
  await prisma.orderReview.deleteMany();

  await prisma.orderOfferItem.deleteMany();
  await prisma.orderOffer.deleteMany();

  await prisma.orderStatusHistory.deleteMany();

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  await prisma.productImage.deleteMany();
  await prisma.file.deleteMany();

  await prisma.productComponent.deleteMany();
  await prisma.productVariant.deleteMany();

  await prisma.floristCompensationRule.deleteMany();

  await prisma.product.deleteMany();

  await prisma.user.deleteMany();

  await prisma.florist.deleteMany();
  await prisma.address.deleteMany();

  await prisma.category.deleteMany();
  await prisma.taxCode.deleteMany();

  console.log('✅ Database cleaned.');
}


/*
 * ============================================================
 * TAX CODES
 * ============================================================
 */

async function createTaxCodes() {
  console.log('💶 Creating tax codes...');

  const vat23 = await prisma.taxCode.create({
    data: {
      code: 'PT_VAT_23',
      name: 'IVA Normal 23%',
      rate: 23.00,
    },
  });

  const vat13 = await prisma.taxCode.create({
    data: {
      code: 'PT_VAT_13',
      name: 'IVA Intermédio 13%',
      rate: 13.00,
    },
  });

  const vat6 = await prisma.taxCode.create({
    data: {
      code: 'PT_VAT_6',
      name: 'IVA Reduzido 6%',
      rate: 6.00,
    },
  });

  return {
    vat23,
    vat13,
    vat6,
  };
}


/*
 * ============================================================
 * CATEGORIES
 * ============================================================
 */

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

  return {
    bouquets,
    plants,
    funeral,
  };
}


/*
 * ============================================================
 * FILES
 * ============================================================
 */

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


/*
 * ============================================================
 * PRODUCT IMAGES
 * ============================================================
 */

async function createProductImage(
  productId: number,
  fileId: number,
  options?: {
    variantId?: number;
    altText?: string;
    sortOrder?: number;
    isPrimary?: boolean;
  },
) {
  return prisma.productImage.create({
    data: {
      product: {
        connect: {
          id: productId,
        },
      },

      file: {
        connect: {
          id: fileId,
        },
      },

      ...(options?.variantId !== undefined && {
        variant: {
          connect: {
            id: options.variantId,
          },
        },
      }),

      altText: options?.altText,
      sortOrder: options?.sortOrder ?? 0,
      isPrimary: options?.isPrimary ?? false,
    },
  });
}


/*
 * ============================================================
 * PRODUCT COMPONENTS
 * ============================================================
 */

async function createProductComponent(
  productId: number,
  data: {
    name: string;
    minQuantity: number;
    recommendedQuantity: number;
    maxQuantity: number;
    customerPricePerAdditionalUnit: number;
    floristCompensationPerAdditionalUnit: number;
    sortOrder?: number;
  },
) {
  return prisma.productComponent.create({
    data: {
      product: {
        connect: {
          id: productId,
        },
      },

      name: data.name,

      minQuantity: data.minQuantity,
      recommendedQuantity: data.recommendedQuantity,
      maxQuantity: data.maxQuantity,

      customerPricePerAdditionalUnit:
        data.customerPricePerAdditionalUnit,

      floristCompensationPerAdditionalUnit:
        data.floristCompensationPerAdditionalUnit,

      sortOrder: data.sortOrder ?? 0,
    },
  });
}


/*
 * ============================================================
 * PRODUCT VARIANTS
 * ============================================================
 */

async function createProductVariant(
  productId: number,
  data: {
    type: ProductVariantType;
    name: string;
    code?: string;
    price: number;
    floristCompensation: number;
    sortOrder?: number;
  },
) {
  return prisma.productVariant.create({
    data: {
      product: {
        connect: {
          id: productId,
        },
      },

      type: data.type,
      name: data.name,
      code: data.code,

      price: data.price,
      floristCompensation: data.floristCompensation,

      sortOrder: data.sortOrder ?? 0,
    },
  });
}


/*
 * ============================================================
 * PRODUCTS
 * ============================================================
 */

async function createProducts(
  taxCodes: Awaited<
    ReturnType<typeof createTaxCodes>
  >,
  categories: Awaited<
    ReturnType<typeof createCategories>
  >,
) {
  console.log('🌸 Creating products...');

  /*
   * ==========================================================
   * 1. ORQUÍDEA BRANCA
   * Simple
   * ==========================================================
   */

  const orchid = await prisma.product.create({
    data: {
      name: 'Orquídea Branca',
      slug: 'orquidea-branca',
      description:
        'Orquídea branca em vaso decorativo, perfeita para oferecer ou decorar a casa.',

      basePrice: 34.90,
      baseFloristCompensation: 25.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.plants.id,
        },
      },

      sortOrder: 0,
    },
  });


  /*
   * ==========================================================
   * 2. RAMO PRIMAVERA
   * Components
   * ==========================================================
   */

  const primavera = await prisma.product.create({
    data: {
      name: 'Ramo Primavera',
      slug: 'ramo-primavera',
      description:
        'Ramo colorido de flores da estação, personalizável em quantidade.',

      basePrice: 39.90,
      baseFloristCompensation: 30.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.bouquets.id,
        },
      },

      sortOrder: 1,
    },
  });

  await createProductComponent(primavera.id, {
    name: 'Rosas',
    minQuantity: 6,
    recommendedQuantity: 12,
    maxQuantity: 24,
    customerPricePerAdditionalUnit: 2.50,
    floristCompensationPerAdditionalUnit: 1.50,
    sortOrder: 0,
  });

  await createProductComponent(primavera.id, {
    name: 'Peónias',
    minQuantity: 3,
    recommendedQuantity: 6,
    maxQuantity: 12,
    customerPricePerAdditionalUnit: 3.50,
    floristCompensationPerAdditionalUnit: 2.00,
    sortOrder: 1,
  });


  /*
   * ==========================================================
   * 3. ROSAS VERMELHAS
   * Components
   * ==========================================================
   */

  const redRoses = await prisma.product.create({
    data: {
      name: 'Rosas Vermelhas',
      slug: 'rosas-vermelhas',
      description:
        'Bouquet de rosas vermelhas frescas, ideal para momentos românticos.',

      basePrice: 39.90,
      baseFloristCompensation: 30.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.bouquets.id,
        },
      },

      sortOrder: 2,
    },
  });

  await createProductComponent(redRoses.id, {
    name: 'Rosas Vermelhas',
    minQuantity: 6,
    recommendedQuantity: 12,
    maxQuantity: 24,
    customerPricePerAdditionalUnit: 2.50,
    floristCompensationPerAdditionalUnit: 1.50,
    sortOrder: 0,
  });


  /*
   * ==========================================================
   * 4. COROA FLORAL
   * Variants
   * ==========================================================
   */

  const crown = await prisma.product.create({
    data: {
      name: 'Coroa Floral',
      slug: 'coroa-floral',
      description:
        'Coroa floral disponível em diferentes tamanhos.',

      /*
       * Base price must always be the lowest variant price.
       */

      basePrice: 59.90,
      baseFloristCompensation: 45.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.funeral.id,
        },
      },

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


  /*
   * ==========================================================
   * 5. BOUQUET ROMÂNTICO
   * Simple
   * ==========================================================
   */

  const romantic = await prisma.product.create({
    data: {
      name: 'Bouquet Romântico',
      slug: 'bouquet-romantico',
      description:
        'Bouquet elegante de rosas e flores delicadas em tons românticos.',

      basePrice: 49.90,
      baseFloristCompensation: 37.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.bouquets.id,
        },
      },

      sortOrder: 4,
    },
  });


  /*
   * ==========================================================
   * 6. LÍRIOS BRANCOS
   * Components
   * ==========================================================
   */

  const lilies = await prisma.product.create({
    data: {
      name: 'Lírios Brancos',
      slug: 'lirios-brancos',
      description:
        'Arranjo de lírios brancos frescos e perfumados.',

      basePrice: 44.90,
      baseFloristCompensation: 33.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.bouquets.id,
        },
      },

      sortOrder: 5,
    },
  });

  await createProductComponent(lilies.id, {
    name: 'Lírios',
    minQuantity: 5,
    recommendedQuantity: 8,
    maxQuantity: 16,
    customerPricePerAdditionalUnit: 3.00,
    floristCompensationPerAdditionalUnit: 1.80,
    sortOrder: 0,
  });

  await createProductComponent(lilies.id, {
    name: 'Eucalipto',
    minQuantity: 2,
    recommendedQuantity: 4,
    maxQuantity: 8,
    customerPricePerAdditionalUnit: 1.50,
    floristCompensationPerAdditionalUnit: 0.80,
    sortOrder: 1,
  });


  /*
   * ==========================================================
   * 7. TULIPAS COLORIDAS
   * Variants
   * ==========================================================
   */

  const tulips = await prisma.product.create({
    data: {
      name: 'Tulipas Coloridas',
      slug: 'tulipas-coloridas',
      description:
        'Bouquet de tulipas disponível em diferentes tamanhos.',

      basePrice: 29.90,
      baseFloristCompensation: 22.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.bouquets.id,
        },
      },

      sortOrder: 6,
    },
  });

  await createProductVariant(tulips.id, {
    type: ProductVariantType.SIZE,
    name: 'Pequeno',
    code: 'TULIP-S',
    price: 29.90,
    floristCompensation: 22.00,
    sortOrder: 0,
  });

  await createProductVariant(tulips.id, {
    type: ProductVariantType.SIZE,
    name: 'Médio',
    code: 'TULIP-M',
    price: 39.90,
    floristCompensation: 29.00,
    sortOrder: 1,
  });

  await createProductVariant(tulips.id, {
    type: ProductVariantType.SIZE,
    name: 'Grande',
    code: 'TULIP-L',
    price: 54.90,
    floristCompensation: 40.00,
    sortOrder: 2,
  });


  /*
   * ==========================================================
   * 8. SUCULENTA DECORATIVA
   * Simple
   * ==========================================================
   */

  const succulent = await prisma.product.create({
    data: {
      name: 'Suculenta Decorativa',
      slug: 'suculenta-decorativa',
      description:
        'Pequena suculenta em vaso decorativo, fácil de cuidar.',

      basePrice: 19.90,
      baseFloristCompensation: 14.00,

      taxCode: {
        connect: {
          id: taxCodes.vat6.id,
        },
      },

      category: {
        connect: {
          id: categories.plants.id,
        },
      },

      sortOrder: 7,
    },
  });


  /*
   * ==========================================================
   * 9. CAIXA DE FLORES ROMÂNTICA
   * Components
   * ==========================================================
   */

  const flowerBox = await prisma.product.create({
    data: {
      name: 'Caixa de Flores Romântica',
      slug: 'caixa-flores-romantica',
      description:
        'Caixa floral elegante com flores frescas e complementos personalizáveis.',

      basePrice: 54.90,
      baseFloristCompensation: 41.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.bouquets.id,
        },
      },

      sortOrder: 8,
    },
  });

  await createProductComponent(flowerBox.id, {
    name: 'Rosas',
    minQuantity: 6,
    recommendedQuantity: 10,
    maxQuantity: 18,
    customerPricePerAdditionalUnit: 2.80,
    floristCompensationPerAdditionalUnit: 1.70,
    sortOrder: 0,
  });

  await createProductComponent(flowerBox.id, {
    name: 'Chocolate',
    minQuantity: 1,
    recommendedQuantity: 2,
    maxQuantity: 4,
    customerPricePerAdditionalUnit: 5.00,
    floristCompensationPerAdditionalUnit: 3.00,
    sortOrder: 1,
  });

  await createProductComponent(flowerBox.id, {
    name: 'Cartão',
    minQuantity: 0,
    recommendedQuantity: 1,
    maxQuantity: 1,
    customerPricePerAdditionalUnit: 2.50,
    floristCompensationPerAdditionalUnit: 1.00,
    sortOrder: 2,
  });


  /*
   * ==========================================================
   * 10. GIRASSÓIS
   * Simple
   * ==========================================================
   */

  const sunflowers = await prisma.product.create({
    data: {
      name: 'Bouquet de Girassóis',
      slug: 'bouquet-girassois',
      description:
        'Bouquet alegre de girassóis frescos.',

      basePrice: 42.90,
      baseFloristCompensation: 32.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.bouquets.id,
        },
      },

      sortOrder: 9,
    },
  });


  /*
   * ==========================================================
   * 11. ARRANJO CAMPO
   * Components
   * ==========================================================
   */

  const fieldArrangement = await prisma.product.create({
    data: {
      name: 'Arranjo Campo',
      slug: 'arranjo-campo',
      description:
        'Arranjo descontraído inspirado nas flores do campo.',

      basePrice: 45.90,
      baseFloristCompensation: 34.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.bouquets.id,
        },
      },

      sortOrder: 10,
    },
  });

  await createProductComponent(fieldArrangement.id, {
    name: 'Flores do Campo',
    minQuantity: 8,
    recommendedQuantity: 12,
    maxQuantity: 24,
    customerPricePerAdditionalUnit: 2.00,
    floristCompensationPerAdditionalUnit: 1.20,
    sortOrder: 0,
  });

  await createProductComponent(fieldArrangement.id, {
    name: 'Eucalipto',
    minQuantity: 2,
    recommendedQuantity: 4,
    maxQuantity: 8,
    customerPricePerAdditionalUnit: 1.50,
    floristCompensationPerAdditionalUnit: 0.80,
    sortOrder: 1,
  });


  /*
   * ==========================================================
   * 12. ORQUÍDEA ROSA
   * Variants
   * ==========================================================
   */

  const pinkOrchid = await prisma.product.create({
    data: {
      name: 'Orquídea Rosa',
      slug: 'orquidea-rosa',
      description:
        'Orquídea rosa elegante disponível em diferentes tamanhos.',

      basePrice: 32.90,
      baseFloristCompensation: 24.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.plants.id,
        },
      },

      sortOrder: 11,
    },
  });

  await createProductVariant(pinkOrchid.id, {
    type: ProductVariantType.SIZE,
    name: 'Pequena',
    code: 'ORQ-ROSA-S',
    price: 32.90,
    floristCompensation: 24.00,
    sortOrder: 0,
  });

  await createProductVariant(pinkOrchid.id, {
    type: ProductVariantType.SIZE,
    name: 'Média',
    code: 'ORQ-ROSA-M',
    price: 44.90,
    floristCompensation: 33.00,
    sortOrder: 1,
  });

  await createProductVariant(pinkOrchid.id, {
    type: ProductVariantType.SIZE,
    name: 'Grande',
    code: 'ORQ-ROSA-L',
    price: 59.90,
    floristCompensation: 44.00,
    sortOrder: 2,
  });


  /*
   * ==========================================================
   * 13. CENTRO DE MESA FLORAL
   * Components
   * ==========================================================
   */

  const centerpiece = await prisma.product.create({
    data: {
      name: 'Centro de Mesa Floral',
      slug: 'centro-mesa-floral',
      description:
        'Arranjo floral elegante para mesas de jantar e ocasiões especiais.',

      basePrice: 49.90,
      baseFloristCompensation: 37.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.bouquets.id,
        },
      },

      sortOrder: 12,
    },
  });

  await createProductComponent(centerpiece.id, {
    name: 'Rosas',
    minQuantity: 5,
    recommendedQuantity: 8,
    maxQuantity: 15,
    customerPricePerAdditionalUnit: 2.50,
    floristCompensationPerAdditionalUnit: 1.50,
    sortOrder: 0,
  });

  await createProductComponent(centerpiece.id, {
    name: 'Velas',
    minQuantity: 0,
    recommendedQuantity: 2,
    maxQuantity: 4,
    customerPricePerAdditionalUnit: 3.50,
    floristCompensationPerAdditionalUnit: 2.00,
    sortOrder: 1,
  });


  /*
   * ==========================================================
   * 14. BOUQUET PREMIUM
   * Variants
   * ==========================================================
   */

  const premium = await prisma.product.create({
    data: {
      name: 'Bouquet Premium',
      slug: 'bouquet-premium',
      description:
        'Bouquet premium composto por flores selecionadas e apresentação sofisticada.',

      basePrice: 69.90,
      baseFloristCompensation: 52.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.bouquets.id,
        },
      },

      sortOrder: 13,
    },
  });

  await createProductVariant(premium.id, {
    type: ProductVariantType.SIZE,
    name: 'Clássico',
    code: 'PREMIUM-S',
    price: 69.90,
    floristCompensation: 52.00,
    sortOrder: 0,
  });

  await createProductVariant(premium.id, {
    type: ProductVariantType.SIZE,
    name: 'Elegante',
    code: 'PREMIUM-M',
    price: 89.90,
    floristCompensation: 67.00,
    sortOrder: 1,
  });

  await createProductVariant(premium.id, {
    type: ProductVariantType.SIZE,
    name: 'Luxo',
    code: 'PREMIUM-L',
    price: 119.90,
    floristCompensation: 89.00,
    sortOrder: 2,
  });


  /*
   * ==========================================================
   * 15. COROA DE ROSAS BRANCAS
   * Simple
   * ==========================================================
   */

  const whiteFuneral = await prisma.product.create({
    data: {
      name: 'Coroa de Rosas Brancas',
      slug: 'coroa-rosas-brancas',
      description:
        'Coroa floral de rosas brancas para cerimónias e homenagens.',

      basePrice: 89.90,
      baseFloristCompensation: 67.00,

      taxCode: {
        connect: {
          id: taxCodes.vat23.id,
        },
      },

      category: {
        connect: {
          id: categories.funeral.id,
        },
      },

      sortOrder: 14,
    },
  });


  console.log('');
  console.log('🌸 15 products created:');
  console.log('  1. Orquídea Branca');
  console.log('  2. Ramo Primavera (components)');
  console.log('  3. Rosas Vermelhas (component)');
  console.log('  4. Coroa Floral (variants)');
  console.log('  5. Bouquet Romântico');
  console.log('  6. Lírios Brancos (components)');
  console.log('  7. Tulipas Coloridas (variants)');
  console.log('  8. Suculenta Decorativa');
  console.log('  9. Caixa de Flores Romântica (components)');
  console.log(' 10. Bouquet de Girassóis');
  console.log(' 11. Arranjo Campo (components)');
  console.log(' 12. Orquídea Rosa (variants)');
  console.log(' 13. Centro de Mesa Floral (components)');
  console.log(' 14. Bouquet Premium (variants)');
  console.log(' 15. Coroa de Rosas Brancas');

  return {
    orchid,
    primavera,
    redRoses,
    crown,
    romantic,
    lilies,
    tulips,
    succulent,
    flowerBox,
    sunflowers,
    fieldArrangement,
    pinkOrchid,
    centerpiece,
    premium,
    whiteFuneral,

    crownSmall,
    crownMedium,
    crownLarge,
  };
}


/*
 * ============================================================
 * PRODUCT IMAGES
 * ============================================================
 */

async function createProductImages(
  products: Awaited<
    ReturnType<typeof createProducts>
  >,
) {
  console.log('🖼️ Creating product images...');

  const productImages = [
    {
      productId: products.orchid.id,
      name: 'orquidea-branca',
      alt: 'Orquídea Branca',
    },
    {
      productId: products.primavera.id,
      name: 'ramo-primavera',
      alt: 'Ramo Primavera',
    },
    {
      productId: products.redRoses.id,
      name: 'rosas-vermelhas',
      alt: 'Rosas Vermelhas',
    },
    {
      productId: products.crown.id,
      name: 'coroa-floral',
      alt: 'Coroa Floral',
    },
    {
      productId: products.romantic.id,
      name: 'bouquet-romantico',
      alt: 'Bouquet Romântico',
    },
    {
      productId: products.lilies.id,
      name: 'lirios-brancos',
      alt: 'Lírios Brancos',
    },
    {
      productId: products.tulips.id,
      name: 'tulipas-coloridas',
      alt: 'Tulipas Coloridas',
    },
    {
      productId: products.succulent.id,
      name: 'suculenta-decorativa',
      alt: 'Suculenta Decorativa',
    },
    {
      productId: products.flowerBox.id,
      name: 'caixa-flores-romantica',
      alt: 'Caixa de Flores Romântica',
    },
    {
      productId: products.sunflowers.id,
      name: 'bouquet-girassois',
      alt: 'Bouquet de Girassóis',
    },
    {
      productId: products.fieldArrangement.id,
      name: 'arranjo-campo',
      alt: 'Arranjo Campo',
    },
    {
      productId: products.pinkOrchid.id,
      name: 'orquidea-rosa',
      alt: 'Orquídea Rosa',
    },
    {
      productId: products.centerpiece.id,
      name: 'centro-mesa-floral',
      alt: 'Centro de Mesa Floral',
    },
    {
      productId: products.premium.id,
      name: 'bouquet-premium',
      alt: 'Bouquet Premium',
    },
    {
      productId: products.whiteFuneral.id,
      name: 'coroa-rosas-brancas',
      alt: 'Coroa de Rosas Brancas',
    },
  ];

  for (const image of productImages) {
    const file = await createFile(
      `${image.name}.jpg`,
      `${image.name}.jpg`,
      `/products/${image.name}.jpg`,
      image.alt,
    );

    await createProductImage(
      image.productId,
      file.id,
      {
        altText: image.alt,
        sortOrder: 0,
        isPrimary: true,
      },
    );
  }

  /*
   * Variant-specific images for Coroa Floral.
   */

  const crownVariants = [
    {
      variantId: products.crownSmall.id,
      name: 'coroa-floral-pequena',
      alt: 'Coroa Floral Pequena',
    },
    {
      variantId: products.crownMedium.id,
      name: 'coroa-floral-media',
      alt: 'Coroa Floral Média',
    },
    {
      variantId: products.crownLarge.id,
      name: 'coroa-floral-grande',
      alt: 'Coroa Floral Grande',
    },
  ];

  for (const image of crownVariants) {
    const file = await createFile(
      `${image.name}.jpg`,
      `${image.name}.jpg`,
      `/products/${image.name}.jpg`,
      image.alt,
    );

    await createProductImage(
      products.crown.id,
      file.id,
      {
        variantId: image.variantId,
        altText: image.alt,
        sortOrder: 1,
        isPrimary: false,
      },
    );
  }
}


/*
 * ============================================================
 * ADDRESS
 * ============================================================
 */

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


/*
 * ============================================================
 * FLORIST
 * ============================================================
 */

async function createFlorist(addressId: number) {
  console.log('🌷 Creating florist...');

  return prisma.florist.create({
    data: {
      name: 'Momentos em Flor Braga',

      legalName:
        'Momentos em Flor Braga, Lda.',

      taxNumber: '999999990',

      email: 'braga@momentosemflor.pt',

      phone: '+351253000000',

      website:
        'https://momentosemflor.pt',

      description:
        'Florista parceira de Braga.',

      deliveryRadiusKm: 20,

      address: {
        connect: {
          id: addressId,
        },
      },
    },
  });
}


/*
 * ============================================================
 * USERS
 * ============================================================
 */

async function createUsers(floristId: number) {
  console.log('👤 Creating users...');

  const adminPasswordHash =
    await bcrypt.hash(
      'Admin123!',
      10,
    );

  const admin =
    await prisma.user.create({
      data: {
        firstName: 'Diogo',
        lastName: 'Silva',

        email:
          'admin@momentosemflor.pt',

        passwordHash:
          adminPasswordHash,

        role: 'SYSTEM_ADMIN',

        floristId: null,

        active: true,
        emailVerified: true,
      },
    });


  const floristPasswordHash =
    await bcrypt.hash(
      'Florist123!',
      10,
    );

  const floristUser =
    await prisma.user.create({
      data: {
        firstName: 'Florista',
        lastName: 'Braga',

        email:
          'florist@momentosemflor.pt',

        passwordHash:
          floristPasswordHash,

        role: 'FLORIST',

        florist: {
          connect: {
            id: floristId,
          },
        },

        active: true,
        emailVerified: true,
      },
    });


  const customerPasswordHash =
    await bcrypt.hash(
      'Customer123!',
      12,
    );

  const customer =
    await prisma.user.create({
      data: {
        firstName: 'João',
        lastName: 'Silva',

        email:
          'customer@momentosemflor.pt',

        passwordHash:
          customerPasswordHash,

        phone:
          '910000000',

        role: 'CUSTOMER',

        active: true,
        emailVerified: true,
      },
    });


  return {
    admin,
    floristUser,
    customer,
  };
}


/*
 * ============================================================
 * MAIN
 * ============================================================
 */

async function main() {
  console.log('');
  console.log('🌱 Starting database seed...');
  console.log('');

  await cleanDatabase();

  const taxCodes =
    await createTaxCodes();

  const categories =
    await createCategories();

  const products =
    await createProducts(
      taxCodes,
      categories,
    );

  await createProductImages(
    products,
  );

  const address =
    await createAddress();

  const florist =
    await createFlorist(
      address.id,
    );

  await createUsers(
    florist.id,
  );

  console.log('');
  console.log(
    '==========================================',
  );
  console.log(
    '✅ Database seeded successfully!',
  );
  console.log(
    '==========================================',
  );
  console.log('');

  console.log(
    'Products: 15',
  );

  console.log(
    '  - 6 simple products',
  );

  console.log(
    '  - 5 products with components',
  );

  console.log(
    '  - 4 products with variants',
  );

  console.log('');

  console.log(
    'Users:',
  );

  console.log(
    '  Admin: admin@momentosemflor.pt',
  );

  console.log(
    '  Florist: florist@momentosemflor.pt',
  );

  console.log(
    '  Customer: customer@momentosemflor.pt',
  );

  console.log('');
}


/*
 * ============================================================
 * EXECUTION
 * ============================================================
 */

main()
  .catch((error) => {
    console.error('');
    console.error(
      '❌ Seed failed:',
    );
    console.error(error);

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
