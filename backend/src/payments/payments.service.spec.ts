import { BadRequestException } from '@nestjs/common';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import type { AuthenticatedUser } from '@/auth/interfaces/authenticated-user.interface';
import type { PrismaService } from '@/prisma/prisma.service';
import type { StripeService } from './stripe.service';
import { PaymentsService } from './payments.service';
import type { MoloniFiscalLifecycleService } from '@/moloni/fiscal/moloni-fiscal-lifecycle.service';

describe('PaymentsService', () => {
  const user: AuthenticatedUser = {
    id: 7,
    email: 'customer@example.com',
    firstName: 'Maria',
    lastName: 'Silva',
    phone: '+351900000000',
    role: 'CUSTOMER',
    floristId: null,
  };

  function createService() {
    const tx = {
      payment: {
        updateMany: jest.fn(),
      },
      order: {
        updateMany: jest.fn(),
      },
    };

    const prismaMock = {
      order: {
        findUnique: jest.fn(),
      },
      payment: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(
        async (callback: (transaction: typeof tx) => Promise<void>) =>
          callback(tx),
      ),
    };

    const stripeMock = {
      createPaymentIntent: jest.fn(),
      retrievePaymentIntent: jest.fn(),
      constructWebhookEvent: jest.fn(),
    };

    const moloniFiscalLifecycleMock = {
      queuePaidOrder: jest.fn(),
    };

    const service = new PaymentsService(
      prismaMock as unknown as PrismaService,
      stripeMock as unknown as StripeService,
      moloniFiscalLifecycleMock as unknown as MoloniFiscalLifecycleService,
    );

    return { service, prismaMock, stripeMock, moloniFiscalLifecycleMock, tx };
  }

  it('creates an idempotent PaymentIntent only for the customer order', async () => {
    const { service, prismaMock, stripeMock } = createService();
    const updatedAt = new Date(0);

    prismaMock.order.findUnique.mockResolvedValue({
      id: 10,
      customerId: user.id,
      orderNumber: 'MF-2026-123456',
      status: OrderStatus.PENDING_PAYMENT,
      total: 25,
      payment: null,
    });
    prismaMock.payment.upsert.mockResolvedValue({
      id: 5,
      orderId: 10,
      status: PaymentStatus.PENDING,
      amount: 25,
      currency: 'EUR',
      stripePaymentIntentId: null,
      paidAt: null,
      createdAt: updatedAt,
      updatedAt,
    });
    stripeMock.createPaymentIntent.mockResolvedValue({
      id: 'pi_123',
      client_secret: 'secret_123',
    });
    prismaMock.payment.update.mockResolvedValue({});

    await expect(
      service.createPaymentIntent(user, 'MF-2026-123456'),
    ).resolves.toEqual({ clientSecret: 'secret_123' });

    expect(prismaMock.order.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          orderNumber: 'MF-2026-123456',
          customerId: user.id,
        },
      }),
    );
    expect(stripeMock.createPaymentIntent).toHaveBeenCalledWith(
      25,
      { orderId: '10', paymentId: '5' },
      'payment-5-0',
    );
  });

  it('reuses the current pending PaymentIntent', async () => {
    const { service, prismaMock, stripeMock } = createService();

    prismaMock.order.findUnique.mockResolvedValue({
      id: 10,
      customerId: user.id,
      orderNumber: 'MF-2026-123456',
      status: OrderStatus.PENDING_PAYMENT,
      total: 25,
      payment: {
        id: 5,
        orderId: 10,
        status: PaymentStatus.PENDING,
        amount: 25,
        currency: 'EUR',
        stripePaymentIntentId: 'pi_existing',
        paidAt: null,
        createdAt: new Date(0),
        updatedAt: new Date(0),
      },
    });
    stripeMock.retrievePaymentIntent.mockResolvedValue({
      id: 'pi_existing',
      status: 'requires_payment_method',
      client_secret: 'secret_existing',
    });

    await expect(
      service.createPaymentIntent(user, 'MF-2026-123456'),
    ).resolves.toEqual({ clientSecret: 'secret_existing' });
    expect(stripeMock.createPaymentIntent).not.toHaveBeenCalled();
  });

  it('rejects a succeeded webhook that does not match the stored payment', async () => {
    const { service, prismaMock, stripeMock } = createService();

    stripeMock.constructWebhookEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_unexpected',
          amount: 2500,
          currency: 'eur',
          metadata: { paymentId: '5', orderId: '10' },
        },
      },
    });
    prismaMock.payment.findUnique.mockResolvedValue({
      id: 5,
      orderId: 10,
      status: PaymentStatus.PENDING,
      amount: 25,
      currency: 'EUR',
      stripePaymentIntentId: 'pi_expected',
    });

    await expect(
      service.handleWebhook(Buffer.from('{}'), 'signature'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('marks payment and order paid atomically for a matching webhook', async () => {
    const { service, prismaMock, stripeMock, tx } = createService();

    stripeMock.constructWebhookEvent.mockReturnValue({
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_expected',
          amount: 2500,
          currency: 'eur',
          metadata: { paymentId: '5', orderId: '10' },
        },
      },
    });
    prismaMock.payment.findUnique.mockResolvedValue({
      id: 5,
      orderId: 10,
      status: PaymentStatus.PENDING,
      amount: 25,
      currency: 'EUR',
      stripePaymentIntentId: 'pi_expected',
    });
    tx.payment.updateMany.mockResolvedValue({ count: 1 });
    tx.order.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      service.handleWebhook(Buffer.from('{}'), 'signature'),
    ).resolves.toEqual({ received: true });
    expect(tx.payment.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: PaymentStatus.PENDING,
          stripePaymentIntentId: 'pi_expected',
        }),
      }),
    );
    expect(tx.order.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 10,
          status: OrderStatus.PENDING_PAYMENT,
        },
      }),
    );
  });
});
