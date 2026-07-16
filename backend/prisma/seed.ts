import { generateSlug } from '@/common/utils/slug';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {

  const categories = [
    {
      name: 'Bouquets',
      slug: 'bouquets',
      description: 'Beautiful flower bouquets.',
    },
    {
      name: 'Roses',
      slug: 'roses',
      description: 'Fresh roses.',
    },
    {
      name: 'Wedding',
      slug: 'wedding',
      description: 'Wedding flower arrangements.',
    },
    {
      name: 'Birthday',
      slug: 'birthday',
      description: 'Birthday flowers.',
    },
    {
      name: 'Funeral',
      slug: 'funeral',
      description: 'Funeral flowers.',
    },
    {
      name: 'Plants',
      slug: 'plants',
      description: 'Indoor and outdoor plants.',
    },
  ];

  for (const category of categories) {
    const slug = generateSlug(category.name)
    await prisma.category.upsert({
      where: {
        slug,
      },
      update: category,
      create: {
        ...category,
        slug,
      }
    });
  }

  const passwordHash = await bcrypt.hash(
    'Admin123!',
    10,
  );

  const address = await prisma.address.create({
    data: {
      label: 'Loja',

      notes: 'Entrada principal',
      street: 'Rua Exemplo, 10',

      postalCode: '4700-000',

      city: 'Braga',

      district: 'Braga',

      country: 'Portugal',

      latitude: 41.545449,

      longitude: -8.426507,
    },
  });

  await prisma.florist.upsert({
    where: {
      taxNumber: '999999990',
    },
    update: {},
    create: {
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

  const florist = await prisma.florist.findUnique({
    where: {
      taxNumber: '999999990',
    },
  });

  await prisma.user.upsert({
    where: {
      email: 'admin@momentosemflor.pt',
    },
    update: {},
    create: {
      firstName: 'System',
      lastName: 'Administrator',

      email: 'admin@momentosemflor.pt',

      passwordHash,

      role: 'SYSTEM_ADMIN',

      emailVerified: true,
    },
  });

  if (florist) {
    await prisma.user.upsert({
      where: {
        email: 'braga@momentosemflor.pt',
      },
      update: {},
      create: {
        firstName: 'Braga',
        lastName: 'Florist',

        email: 'braga@momentosemflor.pt',

        passwordHash,

        role: 'FLORIST',

        floristId: florist.id,

        emailVerified: true,
      },
    });
  }

  await prisma.user.upsert({
    where: {
      email: 'customer@test.com',
    },
    update: {},
    create: {
      firstName: 'John',
      lastName: 'Doe',

      email: 'customer@test.com',

      passwordHash,

      role: 'CUSTOMER',

      emailVerified: true,
    },
  });

  console.log('Seed completed.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });