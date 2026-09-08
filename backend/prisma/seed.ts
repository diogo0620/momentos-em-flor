
import {
  PrismaClient,
  ProductPricingType,
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

  /*
   * Delete children before parents because of foreign keys.
   */

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
      floristCompensation:
        data.floristCompensation,

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
   * ----------------------------------------------------------
   * PRODUCT 1
   *
   * Simple product:
   * - no components
   * - no variants
   *
   * Uses basePrice and baseFloristCompensation.
   * ----------------------------------------------------------
   */

  const orchid = await prisma.product.create({
    data: {
      name: 'Orquídea Branca',
      slug: 'orquidea-branca',
      description:
        'Orquídea branca em vaso decorativo.',

      pricingType:
        ProductPricingType.FIXED,

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
   * ----------------------------------------------------------
   * PRODUCT 2
   *
   * Configurable product:
   * - components
   * - no variants
   *
   * The minimum quantity of each component is included
   * in the base price.
   * ----------------------------------------------------------
   */

  const primavera = await prisma.product.create({
    data: {
      name: 'Ramo Primavera',
      slug: 'ramo-primavera',

      description:
        'Ramo colorido de flores da estação, personalizável em quantidade.',

      pricingType:
        ProductPricingType.FIXED,

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

  /*
   * Roses
   *
   * 6 included
   * 12 recommended
   * 24 maximum
   */

  await createProductComponent(
    primavera.id,
    {
      name: 'Rosas',
      minQuantity: 6,
      recommendedQuantity: 12,
      maxQuantity: 24,

      customerPricePerAdditionalUnit: 2.50,
      floristCompensationPerAdditionalUnit: 1.50,

      sortOrder: 0,
    },
  );

  /*
   * Peonies
   *
   * 3 included
   * 6 recommended
   * 12 maximum
   */

  await createProductComponent(
    primavera.id,
    {
      name: 'Peónias',
      minQuantity: 3,
      recommendedQuantity: 6,
      maxQuantity: 12,

      customerPricePerAdditionalUnit: 3.50,
      floristCompensationPerAdditionalUnit: 2.00,

      sortOrder: 1,
    },
  );


  /*
   * ----------------------------------------------------------
   * PRODUCT 3
   *
   * Configurable product with one component.
   * ----------------------------------------------------------
   */

  const redRoses = await prisma.product.create({
    data: {
      name: 'Rosas Vermelhas',
      slug: 'rosas-vermelhas',

      description:
        'Bouquet de rosas vermelhas frescas, personalizável em quantidade.',

      pricingType:
        ProductPricingType.FIXED,

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

  await createProductComponent(
    redRoses.id,
    {
      name: 'Rosas Vermelhas',

      minQuantity: 6,
      recommendedQuantity: 12,
      maxQuantity: 24,

      customerPricePerAdditionalUnit: 2.50,
      floristCompensationPerAdditionalUnit: 1.50,

      sortOrder: 0,
    },
  );


  /*
   * ----------------------------------------------------------
   * PRODUCT 4
   *
   * Product with VARIANTS.
   *
   * Important:
   * This product does NOT have components.
   *
   * Prices and florist compensation are defined
   * independently for each variant.
   * ----------------------------------------------------------
   */

  const crown = await prisma.product.create({
    data: {
      name: 'Coroa Floral',
      slug: 'coroa-floral',

      description:
        'Coroa floral disponível em diferentes tamanhos.',

      pricingType:
        ProductPricingType.FIXED,

      /*
       * No base price because variants define
       * their own prices.
       */

      basePrice: null,
      baseFloristCompensation: null,

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


  /*
   * Small
   */

  const crownSmall =
    await createProductVariant(
      crown.id,
      {
        type: ProductVariantType.SIZE,

        name: 'Pequena',
        code: 'COROA-S',

        price: 59.90,
        floristCompensation: 45.00,

        sortOrder: 0,
      },
    );


  /*
   * Medium
   */

  const crownMedium =
    await createProductVariant(
      crown.id,
      {
        type: ProductVariantType.SIZE,

        name: 'Média',
        code: 'COROA-M',

        price: 79.90,
        floristCompensation: 60.00,

        sortOrder: 1,
      },
    );


  /*
   * Large
   */

  const crownLarge =
    await createProductVariant(
      crown.id,
      {
        type: ProductVariantType.SIZE,

        name: 'Grande',
        code: 'COROA-L',

        price: 109.90,
        floristCompensation: 82.00,

        sortOrder: 2,
      },
    );


  return {
    orchid,
    primavera,
    redRoses,
    crown,
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


  /*
   * ----------------------------------------------------------
   * Ramo Primavera
   *
   * Product-wide image.
   * ----------------------------------------------------------
   */

  const primaveraFile =
    await createFile(
      'ramo-primavera.jpg',
      'ramo-primavera.jpg',
      '/products/ramo-primavera.jpg',
      'Ramo Primavera',
    );

  await createProductImage(
    products.primavera.id,
    primaveraFile.id,
    {
      altText: 'Ramo Primavera',
      sortOrder: 0,
      isPrimary: true,
    },
  );


  /*
   * ----------------------------------------------------------
   * Orquídea
   * ----------------------------------------------------------
   */

  const orchidFile =
    await createFile(
      'orquidea-branca.jpg',
      'orquidea-branca.jpg',
      '/products/orquidea-branca.jpg',
      'Orquídea Branca',
    );

  await createProductImage(
    products.orchid.id,
    orchidFile.id,
    {
      altText: 'Orquídea Branca',
      sortOrder: 0,
      isPrimary: true,
    },
  );


  /*
   * ----------------------------------------------------------
   * Rosas Vermelhas
   * ----------------------------------------------------------
   */

  const rosesFile =
    await createFile(
      'rosas-vermelhas.jpg',
      'rosas-vermelhas.jpg',
      '/products/rosas-vermelhas.jpg',
      'Rosas Vermelhas',
    );

  await createProductImage(
    products.redRoses.id,
    rosesFile.id,
    {
      altText: 'Rosas Vermelhas',
      sortOrder: 0,
      isPrimary: true,
    },
  );


  /*
   * ----------------------------------------------------------
   * Coroa Floral
   *
   * Product-wide image.
   * ----------------------------------------------------------
   */

  const crownGeneralFile =
    await createFile(
      'coroa-floral.jpg',
      'coroa-floral.jpg',
      '/products/coroa-floral.jpg',
      'Coroa Floral',
    );

  await createProductImage(
    products.crown.id,
    crownGeneralFile.id,
    {
      altText: 'Coroa Floral',
      sortOrder: 0,
      isPrimary: true,
    },
  );


  /*
   * ----------------------------------------------------------
   * Coroa Pequena
   * ----------------------------------------------------------
   */

  const crownSmallFile =
    await createFile(
      'coroa-pequena.jpg',
      'coroa-pequena.jpg',
      '/products/coroa-pequena.jpg',
      'Coroa Floral Pequena',
    );

  await createProductImage(
    products.crown.id,
    crownSmallFile.id,
    {
      variantId: products.crownSmall.id,

      altText:
        'Coroa Floral Pequena',

      sortOrder: 0,
      isPrimary: true,
    },
  );


  /*
   * ----------------------------------------------------------
   * Coroa Média
   * ----------------------------------------------------------
   */

  const crownMediumFile =
    await createFile(
      'coroa-media.jpg',
      'coroa-media.jpg',
      '/products/coroa-media.jpg',
      'Coroa Floral Média',
    );

  await createProductImage(
    products.crown.id,
    crownMediumFile.id,
    {
      variantId: products.crownMedium.id,

      altText:
        'Coroa Floral Média',

      sortOrder: 0,
      isPrimary: true,
    },
  );


  /*
   * ----------------------------------------------------------
   * Coroa Grande
   * ----------------------------------------------------------
   */

  const crownLargeFile =
    await createFile(
      'coroa-grande.jpg',
      'coroa-grande.jpg',
      '/products/coroa-grande.jpg',
      'Coroa Floral Grande',
    );

  await createProductImage(
    products.crown.id,
    crownLargeFile.id,
    {
      variantId: products.crownLarge.id,

      altText:
        'Coroa Floral Grande',

      sortOrder: 0,
      isPrimary: true,
    },
  );
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

      notes:
        'Morada de teste da florista.',
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
      name:
        'Momentos em Flor Braga',

      legalName:
        'Momentos em Flor Braga, Lda.',

      taxNumber:
        '999999990',

      email:
        'braga@momentosemflor.pt',

      phone:
        '+351253000000',

      website:
        'https://momentosemflor.pt',

      description:
        'Florista parceira de Braga.',

      deliveryRadiusKm:
        20,

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


  /*
   * System Admin
   */

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


  /*
   * Florist Admin
   */

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


  /*
   * Customer
   */

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

  /*
   * 1. Clean
   */

  await cleanDatabase();


  /*
   * 2. Tax codes
   */

  const taxCodes =
    await createTaxCodes();


  /*
   * 3. Categories
   */

  const categories =
    await createCategories();


  /*
   * 4. Products
   */

  const products =
    await createProducts(
      taxCodes,
      categories,
    );


  /*
   * 5. Product images
   */

  await createProductImages(
    products,
  );


  /*
   * 6. Address
   */

  const address =
    await createAddress();


  /*
   * 7. Florist
   */

  const florist =
    await createFlorist(
      address.id,
    );


  /*
   * 8. Users
   */

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
    'Products:',
  );

  console.log(
    `  - ${products.orchid.name}`,
  );

  console.log(
    `  - ${products.primavera.name} (components)`,
  );

  console.log(
    `  - ${products.redRoses.name} (component)`,
  );

  console.log(
    `  - ${products.crown.name} (variants)`,
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
