import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`A variável ${name} é obrigatória no primeiro arranque.`);
  return value;
}

function isStrongPassword(value: string): boolean {
  return (
    value.length >= 8 &&
    /[a-z]/.test(value) &&
    /[A-Z]/.test(value) &&
    /\d/.test(value) &&
    /[^A-Za-z0-9]/.test(value)
  );
}

async function bootstrap() {
  const taxCode = await prisma.taxCode.upsert({
    where: { name: 'IVA Normal 23%' },
    update: { active: true },
    create: {
      name: 'IVA Normal 23%',
      description: 'Taxa normal de IVA para Portugal continental.',
      rate: 23,
      active: true,
    },
  });

  const deliveryFee = Number(process.env.DEFAULT_DELIVERY_FEE ?? '5');
  if (!Number.isFinite(deliveryFee) || deliveryFee < 0) {
    throw new Error('DEFAULT_DELIVERY_FEE tem de ser um número igual ou superior a zero.');
  }
  const deliveryRadiusKm = Number(process.env.DEFAULT_DELIVERY_RADIUS_KM ?? '15');
  if (!Number.isFinite(deliveryRadiusKm) || deliveryRadiusKm < 1 || deliveryRadiusKm > 200) {
    throw new Error('DEFAULT_DELIVERY_RADIUS_KM tem de ser um número entre 1 e 200.');
  }

  await prisma.storeSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      deliveryFee,
      deliveryTaxCodeId: taxCode.id,
      deliveryAreaEnabled: true,
      deliveryAreaName: 'Santa Maria da Feira e arredores',
      deliveryCenterLatitude: 40.924574,
      deliveryCenterLongitude: -8.543956,
      deliveryRadiusKm,
    },
  });

  const existingAdmin = await prisma.user.findFirst({
    where: { role: UserRole.SYSTEM_ADMIN },
    select: { id: true },
  });

  if (existingAdmin) return;

  const email = required('BOOTSTRAP_ADMIN_EMAIL').toLowerCase();
  const password = required('BOOTSTRAP_ADMIN_PASSWORD');
  const phone = required('BOOTSTRAP_ADMIN_PHONE');

  if (!/^\+\d{8,15}$/.test(phone)) {
    throw new Error('BOOTSTRAP_ADMIN_PHONE deve estar no formato internacional, por exemplo +351912345678.');
  }
  if (!isStrongPassword(password)) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD não cumpre os requisitos de segurança.');
  }

  await prisma.user.create({
    data: {
      firstName: process.env.BOOTSTRAP_ADMIN_FIRST_NAME?.trim() || 'Administrador',
      lastName: process.env.BOOTSTRAP_ADMIN_LAST_NAME?.trim() || 'Momentos em Flor',
      email,
      phone,
      passwordHash: await bcrypt.hash(password, 12),
      role: UserRole.SYSTEM_ADMIN,
      active: true,
      emailVerified: true,
    },
  });

  console.log(`Administrador inicial criado: ${email}`);
}

bootstrap()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
