import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, SupportTicketStatus } from '@prisma/client';
import { randomUUID } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateSupportTicketDto } from './dtos/create-support-ticket.dto';
import { CreateSupportMessageDto } from './dtos/create-support-message.dto';

const ticketInclude = {
  customer: { select: { id: true, firstName: true, lastName: true, email: true } },
  order: { select: { id: true, orderNumber: true } },
  messages: {
    orderBy: { createdAt: 'asc' as const },
    include: { author: { select: { id: true, firstName: true, lastName: true, role: true } } },
  },
} satisfies Prisma.SupportTicketInclude;

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  listCustomer(customerId: number) {
    return this.prisma.supportTicket.findMany({
      where: { customerId },
      include: { order: { select: { id: true, orderNumber: true } }, _count: { select: { messages: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getCustomer(customerId: number, id: number) {
    const ticket = await this.prisma.supportTicket.findFirst({ where: { id, customerId }, include: ticketInclude });
    if (!ticket) throw new NotFoundException('Caso de suporte não encontrado.');
    return ticket;
  }

  async createCustomer(customerId: number, dto: CreateSupportTicketDto) {
    if (dto.orderId) {
      const order = await this.prisma.order.findFirst({ where: { id: dto.orderId, customerId }, select: { id: true } });
      if (!order) throw new BadRequestException('A encomenda selecionada não pertence à sua conta.');
    }
    return this.prisma.supportTicket.create({
      data: {
        reference: `SUP-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`,
        customerId,
        orderId: dto.orderId ?? null,
        subject: dto.subject.trim(),
        category: dto.category,
        status: SupportTicketStatus.WAITING_FOR_SUPPORT,
        messages: { create: { authorId: customerId, message: dto.message.trim() } },
      },
      include: ticketInclude,
    });
  }

  async replyCustomer(customerId: number, id: number, dto: CreateSupportMessageDto) {
    const ticket = await this.prisma.supportTicket.findFirst({ where: { id, customerId }, select: { id: true, status: true } });
    if (!ticket) throw new NotFoundException('Caso de suporte não encontrado.');
    if (ticket.status === SupportTicketStatus.CLOSED) throw new BadRequestException('Este caso está encerrado.');
    await this.prisma.$transaction([
      this.prisma.supportMessage.create({ data: { ticketId: id, authorId: customerId, message: dto.message.trim() } }),
      this.prisma.supportTicket.update({ where: { id }, data: { status: SupportTicketStatus.WAITING_FOR_SUPPORT, resolvedAt: null, closedAt: null } }),
    ]);
    return this.getCustomer(customerId, id);
  }

  listAdmin(status?: SupportTicketStatus, search?: string) {
    const term = search?.trim();
    return this.prisma.supportTicket.findMany({
      where: {
        ...(status && { status }),
        ...(term && { OR: [
          { reference: { contains: term, mode: 'insensitive' } },
          { subject: { contains: term, mode: 'insensitive' } },
          { customer: { OR: [
            { firstName: { contains: term, mode: 'insensitive' } },
            { lastName: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
          ] } },
        ] }),
      },
      include: { customer: { select: { id: true, firstName: true, lastName: true, email: true } }, order: { select: { id: true, orderNumber: true } }, _count: { select: { messages: true } } },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async getAdmin(id: number) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id }, include: ticketInclude });
    if (!ticket) throw new NotFoundException('Caso de suporte não encontrado.');
    return ticket;
  }

  async replyAdmin(adminId: number, id: number, dto: CreateSupportMessageDto) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id }, select: { status: true } });
    if (!ticket) throw new NotFoundException('Caso de suporte não encontrado.');
    if (ticket.status === SupportTicketStatus.CLOSED) throw new BadRequestException('Este caso está encerrado.');
    await this.prisma.$transaction([
      this.prisma.supportMessage.create({ data: { ticketId: id, authorId: adminId, message: dto.message.trim() } }),
      this.prisma.supportTicket.update({ where: { id }, data: { status: SupportTicketStatus.WAITING_FOR_CUSTOMER, resolvedAt: null, closedAt: null } }),
    ]);
    return this.getAdmin(id);
  }

  async updateStatus(id: number, status: SupportTicketStatus) {
    const exists = await this.prisma.supportTicket.findUnique({ where: { id }, select: { id: true } });
    if (!exists) throw new NotFoundException('Caso de suporte não encontrado.');
    await this.prisma.supportTicket.update({
      where: { id },
      data: {
        status,
        resolvedAt: status === SupportTicketStatus.RESOLVED ? new Date() : null,
        closedAt: status === SupportTicketStatus.CLOSED ? new Date() : null,
      },
    });
  }
}
