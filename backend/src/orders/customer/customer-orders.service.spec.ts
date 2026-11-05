import { BadRequestException } from '@nestjs/common';
import { DeliveryTimeSlot, Occasion, UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import type { PrismaService } from '@/prisma/prisma.service';
import type { AdminStoreSettingsService } from '@/store-settings/admin/admin-store-settings.service';
import type { StripeService } from '@/payments/stripe.service';
import type { CustomerOrdersMapper } from './mappers/customer-orders.mapper';
import type { CustomerCreateOrderDto } from './dtos/customer-create-order.dto';
import { CustomerOrdersService } from './customer-orders.service';

describe('CustomerOrdersService order validation', () => {
  const user: AuthenticatedUser = {
    id: 7,
    email: 'customer@example.com',
    firstName: 'Maria',
    lastName: 'Silva',
    phone: '+351900000000',
    role: UserRole.CUSTOMER,
    floristId: null,
  };

  const baseDto: CustomerCreateOrderDto = {
    recipientFirstName: 'Ana',
    occasion: Occasion.BIRTHDAY,
    deliveryDate: '2099-01-01',
    deliveryTimeSlot: DeliveryTimeSlot.AFTERNOON,
    deliveryStreet: 'Rua das Flores',
    deliveryStreetNumber: '1',
    deliveryPostalCode: '1000-001',
    deliveryCity: 'Lisboa',
    deliveryDistrict: 'Lisboa',
    deliveryCountryCode: 'PT',
    items: [{ productId: 1, quantity: 1 }],
  };

  function createService() {
    const prismaMock = {
      product: {
        findMany: jest.fn(),
      },
      $transaction: jest.fn(),
    };
    const settingsMock = {
      get: jest.fn().mockResolvedValue({ deliveryFee: 5 }),
    };

    const service = new CustomerOrdersService(
      prismaMock as unknown as PrismaService,
      {} as CustomerOrdersMapper,
      settingsMock as unknown as AdminStoreSettingsService,
      {} as StripeService,
    );

    return { service, prismaMock };
  }

  function productFixture() {
    return {
      id: 1,
      name: 'Bouquet',
      description: null,
      imagePath: null,
      customerPrice: 25,
      floristPrice: 15,
      taxCodeId: 1,
      taxCode: {
        id: 1,
        active: true,
        rate: 23,
      },
      variants: [],
      components: [],
    };
  }

  it('rejects missing or inactive products', async () => {
    const { service, prismaMock } = createService();
    prismaMock.product.findMany.mockResolvedValue([]);

    await expect(service.create(user, baseDto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rejects a variant that does not belong to the product', async () => {
    const { service, prismaMock } = createService();
    prismaMock.product.findMany.mockResolvedValue([productFixture()]);

    await expect(
      service.create(user, {
        ...baseDto,
        items: [{ productId: 1, variantId: 999, quantity: 1 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it('rejects component quantities outside the configured range', async () => {
    const { service, prismaMock } = createService();
    prismaMock.product.findMany.mockResolvedValue([
      {
        ...productFixture(),
        components: [
          {
            id: 2,
            name: 'Rosas',
            minQuantity: 1,
            recommendedQuantity: 2,
            maxQuantity: 3,
            customerPricePerAdditionalUnit: 2,
            floristPricePerAdditionalUnit: 1,
          },
        ],
      },
    ]);

    await expect(
      service.create(user, {
        ...baseDto,
        items: [
          {
            productId: 1,
            quantity: 1,
            components: [{ componentId: 2, quantity: 4 }],
          },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
