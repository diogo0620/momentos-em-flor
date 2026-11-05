import { BadRequestException } from '@nestjs/common';
import { OrderStatus, UserRole } from '@prisma/client';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import type { PrismaService } from '@/prisma/prisma.service';
import type { FloristOrdersMapper } from './mappers/florist-orders.mapper';
import type { FloristCompensationLifecycleService } from '@/florist-compensations/florist-compensation-lifecycle.service';
import { FloristOrdersService } from './florist-orders.service';

describe('FloristOrdersService status transitions', () => {
  const user: AuthenticatedUser = {
    id: 9,
    email: 'florist@example.com',
    firstName: 'Rita',
    lastName: 'Flores',
    phone: '+351900000001',
    role: UserRole.FLORIST,
    floristId: 3,
  };

  function createService() {
    const prismaMock = {
      order: {
        updateMany: jest.fn(),
        findFirst: jest.fn(),
      },
    };
    const service = new FloristOrdersService(
      prismaMock as unknown as PrismaService,
      {} as FloristOrdersMapper,
      {} as FloristCompensationLifecycleService,
    );

    return { service, prismaMock };
  }

  it('starts production only for an assigned order owned by the florist', async () => {
    const { service, prismaMock } = createService();
    prismaMock.order.updateMany.mockResolvedValue({ count: 1 });

    await expect(service.startProduction(user, 12)).resolves.toBeUndefined();
    expect(prismaMock.order.updateMany).toHaveBeenCalledWith({
      where: {
        id: 12,
        assignedFloristId: 3,
        status: OrderStatus.ASSIGNED,
      },
      data: {
        inProductionAt: expect.any(Date),
        status: OrderStatus.IN_PRODUCTION,
      },
    });
  });

  it('rejects an invalid transition without changing the order', async () => {
    const { service, prismaMock } = createService();
    prismaMock.order.updateMany.mockResolvedValue({ count: 0 });
    prismaMock.order.findFirst.mockResolvedValue({ id: 12 });

    await expect(service.deliver(user, 12)).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
