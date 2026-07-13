import { PrismaClient } from '@prisma/client';
import { DEFAULT_CATEGORIES } from '@/categories/constants/category.seed';

const prisma = new PrismaClient();

async function main() {

  for (const name of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log('Seed completed.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });