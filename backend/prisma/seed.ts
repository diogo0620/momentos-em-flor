import { generateSlug } from '@/common/utils/slug';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: 'Bouquets',
      description: 'Beautiful flower bouquets.',
    },
    {
      name: 'Roses',
      description: 'Fresh roses.',
    },
    {
      name: 'Wedding',
      description: 'Wedding flower arrangements.',
    },
    {
      name: 'Birthday',
      description: 'Birthday flowers.',
    },
    {
      name: 'Funeral',
      description: 'Funeral flowers.',
    },
    {
      name: 'Plants',
      description: 'Indoor and outdoor plants.',
    },
  ];

  for (const category of categories) {
    const slug = generateSlug(category.name);

    await prisma.category.upsert({
      where: { slug },
      update: {
        ...category,
        slug,
      },
      create: {
        ...category,
        slug,
      },
    });
  }

  const passwordHash = await bcrypt.hash('Admin123!', 10);

  const address = await prisma.address.create({
    data: {
      label: 'Loja',
      street: 'Rua Exemplo, 10',
      postalCode: '4700-000',
      city: 'Braga',
      district: 'Braga',
      country: 'Portugal',
      latitude: 41.545449,
      longitude: -8.426507,
      notes: 'Entrada principal',
    },
  });

  const florist = await prisma.florist.upsert({
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
      role: UserRole.SYSTEM_ADMIN,
      emailVerified: true,
    },
  });

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
      role: UserRole.FLORIST,
      floristId: florist.id,
      emailVerified: true,
    },
  });

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
      role: UserRole.CUSTOMER,
      emailVerified: true,
    },
  });

  console.log('✅ Seed completed successfully.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });